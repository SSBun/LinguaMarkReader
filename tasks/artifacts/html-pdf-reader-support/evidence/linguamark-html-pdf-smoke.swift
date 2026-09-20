import AppKit
import WebKit

let root = "/Users/caishilin/Desktop/personal/LinguaMarkReader"
let app = NSApplication.shared
app.setActivationPolicy(.accessory)
let configData = try Data(contentsOf: URL(fileURLWithPath: root + "/src-tauri/tauri.conf.json"))
let settings = try JSONSerialization.jsonObject(with: configData) as! [String: Any]
let csp = ((settings["app"] as! [String: Any])["security"] as! [String: Any])["csp"] as! String
class Handler: NSObject, WKURLSchemeHandler {
    func webView(_ webView: WKWebView, start task: WKURLSchemeTask) {
        let url = task.request.url!
        let path = url.path == "/" ? "/index.html" : url.path
        do {
            let data = try Data(contentsOf: URL(fileURLWithPath: root + "/dist" + path))
            let ext = URL(fileURLWithPath: path).pathExtension
            let mime = ["html": "text/html", "js": "text/javascript", "mjs": "text/javascript", "css": "text/css", "wasm": "application/wasm", "svg": "image/svg+xml"][ext] ?? "application/octet-stream"
            let response = HTTPURLResponse(url: url, statusCode: 200, httpVersion: "HTTP/1.1", headerFields: ["Content-Type": mime, "Content-Security-Policy": csp, "Access-Control-Allow-Origin": "*"])!
            task.didReceive(response); task.didReceive(data); task.didFinish()
        } catch { task.didFailWithError(error) }
    }
    func webView(_ webView: WKWebView, stop task: WKURLSchemeTask) {}
}
class Messages: NSObject, WKScriptMessageHandler {
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        print(message.body)
        fflush(stdout)
        if let value = message.body as? String, value.hasPrefix("DONE:") { exit(value == "DONE:success" ? 0 : 1) }
    }
}
let config = WKWebViewConfiguration()
let handler = Handler()
config.setURLSchemeHandler(handler, forURLScheme: "tauri")
let messages = Messages()
config.userContentController.add(messages, name: "smoke")
let source = try String(contentsOfFile: "/tmp/linguamark-html-pdf-smoke.js", encoding: .utf8)
config.userContentController.addUserScript(WKUserScript(source: source, injectionTime: .atDocumentStart, forMainFrameOnly: true))
let view = WKWebView(frame: NSRect(x: 0, y: 0, width: 1200, height: 820), configuration: config)
let window = NSWindow(contentRect: view.frame, styleMask: [.titled], backing: .buffered, defer: false)
window.contentView = view
window.orderFront(nil)
view.load(URLRequest(url: URL(string: "tauri://localhost/index.html")!))
Timer.scheduledTimer(withTimeInterval: 35, repeats: false) { _ in print("DONE:timeout"); fflush(stdout); exit(1) }
app.run()
