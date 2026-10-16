import ApplicationServices
import Foundation

let arguments = CommandLine.arguments
if arguments.count < 4 || !AXIsProcessTrusted() { exit(2) }
let application = AXUIElementCreateApplication(pid_t(arguments[1])!)
let action = arguments[2]
let marker = arguments[3]
AXUIElementSetAttributeValue(application, "AXEnhancedUserInterface" as CFString, kCFBooleanTrue)

func strings(_ element: AXUIElement) -> [String] {
    [kAXValueAttribute, kAXTitleAttribute, kAXDescriptionAttribute].compactMap { name in
        var value: CFTypeRef?
        guard AXUIElementCopyAttributeValue(element, name as CFString, &value) == .success else { return nil }
        return value as? String
    }
}

func find(_ element: AXUIElement, depth: Int = 0) -> AXUIElement? {
    if depth > 40 { return nil }
    if strings(element).contains(where: { $0.contains(marker) }) {
        if action == "inspect" {
            var role: CFTypeRef?
            AXUIElementCopyAttributeValue(element, kAXRoleAttribute as CFString, &role)
            let result: [String: Any] = ["role": role as? String ?? "", "matches": strings(element).filter { $0.contains(marker) }.map { String($0.prefix(200)) }]
            print(String(data: try! JSONSerialization.data(withJSONObject: result, options: [.sortedKeys]), encoding: .utf8)!)
        } else if action != "press" { return element }
        var actions: CFArray?
        if AXUIElementCopyActionNames(element, &actions) == .success,
           (actions as? [String])?.contains(kAXPressAction) == true { return element }
    }
    var children: CFTypeRef?
    if AXUIElementCopyAttributeValue(element, kAXChildrenAttribute as CFString, &children) == .success,
       let elements = children as? [AXUIElement] {
        for child in elements {
            if let match = find(child, depth: depth + 1) { return match }
        }
    }
    return nil
}

if action == "inspect" { _ = find(application); exit(0) }
let deadline = Date().addingTimeInterval(40)
repeat {
    if let element = find(application) {
        let success = action != "press" || AXUIElementPerformAction(element, kAXPressAction as CFString) == .success
        // Only return the requested UI marker, never article text or persisted values.
        let result: [String: Any] = ["pid": arguments[1], "action": action, "marker": marker, "success": success]
        print(String(data: try JSONSerialization.data(withJSONObject: result, options: [.sortedKeys]), encoding: .utf8)!)
        exit(success ? 0 : 1)
    }
    RunLoop.current.run(until: Date().addingTimeInterval(0.2))
} while Date() < deadline
print("{\"success\":false,\"reason\":\"UI marker not found before deadline\"}")
exit(1)
