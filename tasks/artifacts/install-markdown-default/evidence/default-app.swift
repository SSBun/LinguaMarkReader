import AppKit
import UniformTypeIdentifiers
import CoreServices

let appURL = URL(fileURLWithPath: "/Applications/LinguaMark Reader.app")
if CommandLine.arguments.contains("--set") {
    let status = LSRegisterURL(appURL as CFURL, true)
    guard status == noErr else { print("register error: \(status)"); exit(1) }
    guard let md = UTType(filenameExtension: "md"), let markdown = UTType(filenameExtension: "markdown"),
          md.identifier == "net.daringfireball.markdown", markdown.identifier == md.identifier else {
        print("unexpected Markdown UTI; defaults unchanged"); exit(1)
    }
    var finished = false
    var failure: Error?
    NSWorkspace.shared.setDefaultApplication(at: appURL, toOpen: md) { error in
        failure = error
        finished = true
    }
    let deadline = Date().addingTimeInterval(60)
    while !finished && Date() < deadline { RunLoop.current.run(until: Date().addingTimeInterval(0.1)) }
    guard finished, failure == nil else { print("default handler failed: \(String(describing: failure))"); exit(1) }
}
var result: [String: [String: String]] = [:]
for ext in ["md", "markdown", "txt", "html", "pdf", "json"] {
    if let type = UTType(filenameExtension: ext) {
        let handler = LSCopyDefaultRoleHandlerForContentType(type.identifier as CFString, .all)?.takeRetainedValue() as String?
        let application = NSWorkspace.shared.urlForApplication(toOpen: type)
        result[ext] = ["uti": type.identifier, "handler": handler ?? "", "application": application?.path ?? ""]
    }
}
print(String(data: try JSONSerialization.data(withJSONObject: result, options: [.sortedKeys, .prettyPrinted]), encoding: .utf8)!)
