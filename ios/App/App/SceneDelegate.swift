import UIKit
import Capacitor

// iOS 27 refuses to launch an app built against its SDK unless it adopts the
// UIScene lifecycle. The window now belongs to the scene: UIKit builds it from
// Main.storyboard (UISceneStoryboardFile in Info.plist) and assigns `window`.
//
// URL opens and universal links are delivered to the scene, not the app
// delegate, so they're forwarded to Capacitor's ApplicationDelegateProxy here —
// that's what the App plugin's appUrlOpen / getLaunchUrl read from.
class SceneDelegate: UIResponder, UIWindowSceneDelegate {

    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        // On a cold launch the URL / activity arrives here instead of the
        // openURLContexts / continue callbacks below.
        if let context = connectionOptions.urlContexts.first {
            openURL(context)
        }
        if let userActivity = connectionOptions.userActivities.first {
            continueUserActivity(userActivity)
        }
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        URLContexts.forEach(openURL)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        continueUserActivity(userActivity)
    }

    private func openURL(_ context: UIOpenURLContext) {
        var options: [UIApplication.OpenURLOptionsKey: Any] = [
            .openInPlace: context.options.openInPlace
        ]
        if let sourceApplication = context.options.sourceApplication {
            options[.sourceApplication] = sourceApplication
        }
        if let annotation = context.options.annotation {
            options[.annotation] = annotation
        }
        _ = ApplicationDelegateProxy.shared.application(UIApplication.shared, open: context.url, options: options)
    }

    private func continueUserActivity(_ userActivity: NSUserActivity) {
        _ = ApplicationDelegateProxy.shared.application(UIApplication.shared, continue: userActivity, restorationHandler: { _ in })
    }
}
