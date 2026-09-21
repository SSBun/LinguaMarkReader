import AppKit
import WebKit

let app = NSApplication.shared
app.setActivationPolicy(.accessory)
class Messages: NSObject, WKScriptMessageHandler {
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        print(message.body)
        fflush(stdout)
        if let value = message.body as? String, value.hasPrefix("DONE:") {
            exit(value == "DONE:success" ? 0 : 1)
        }
    }
}
let config = WKWebViewConfiguration()
config.websiteDataStore = .nonPersistent()
let messages = Messages()
config.userContentController.add(messages, name: "verify")
let source = try String(contentsOfFile: "/tmp/linguamark-works-browser.js", encoding: .utf8)
config.userContentController.addUserScript(WKUserScript(source: source, injectionTime: .atDocumentStart, forMainFrameOnly: true))
let view = WKWebView(frame: NSRect(x: 0, y: 0, width: 1200, height: 900), configuration: config)
let window = NSWindow(contentRect: view.frame, styleMask: [.titled], backing: .buffered, defer: false)
window.contentView = view
window.orderBack(nil)
view.load(URLRequest(url: URL(string: "https://ssbun.com/")!, cachePolicy: .reloadIgnoringLocalCacheData))
Timer.scheduledTimer(withTimeInterval: 75, repeats: false) { _ in print("DONE:timeout"); fflush(stdout); exit(1) }
app.run()
