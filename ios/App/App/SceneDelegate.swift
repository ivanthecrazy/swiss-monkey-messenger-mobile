import UIKit
import Capacitor

// iOS 27 refuses to launch an app built against its SDK unless it adopts the
// UIScene lifecycle. The window now belongs to the scene: UIKit builds it from
// Main.storyboard (UISceneStoryboardFile in Info.plist) and assigns `window`.
//
// URL opens and universal links are delivered to the scene, not the app
// delegate, so they're forwarded to Capacitor's SceneDelegateProxy — that's what
// the App plugin's appUrlOpen / getLaunchUrl read from. On a cold launch the
// proxy holds the launch URL until plugins have loaded.
class SceneDelegate: UIResponder, UIWindowSceneDelegate {

    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }
}
