import AppKit
import ApplicationServices
import CoreGraphics

let pid = pid_t(CommandLine.arguments[1])!
let marker = CommandLine.arguments[2]
let application = AXUIElementCreateApplication(pid)
AXUIElementSetAttributeValue(application, "AXEnhancedUserInterface" as CFString, kCFBooleanTrue)
func containsMarker(_ element: AXUIElement, depth: Int = 0) -> Bool {
    if depth > 40 { return false }
    for key in [kAXValueAttribute, kAXTitleAttribute, kAXDescriptionAttribute] {
        var value: CFTypeRef?
        if AXUIElementCopyAttributeValue(element, key as CFString, &value) == .success,
           let string = value as? String, string.contains(marker) { return true }
    }
    var children: CFTypeRef?
    if AXUIElementCopyAttributeValue(element, kAXChildrenAttribute as CFString, &children) == .success,
       let elements = children as? [AXUIElement] {
        for child in elements { if containsMarker(child, depth: depth + 1) { return true } }
    }
    return false
}
var found = false
for _ in 0..<30 {
    if containsMarker(application) { found = true; break }
    RunLoop.current.run(until: Date().addingTimeInterval(0.2))
}
let windows = CGWindowListCopyWindowInfo([.optionOnScreenOnly, .excludeDesktopElements], kCGNullWindowID) as? [[String: Any]] ?? []
let window = windows.first { ($0[kCGWindowOwnerPID as String] as? Int) == Int(pid) && ($0[kCGWindowLayer as String] as? Int) == 0 }
let result: [String: Any] = ["pid": Int(pid), "marker": marker, "foundInAccessibilityTree": found, "windowID": window?[kCGWindowNumber as String] ?? NSNull()]
print(String(data: try JSONSerialization.data(withJSONObject: result, options: [.sortedKeys]), encoding: .utf8)!)
exit(found ? 0 : 1)
