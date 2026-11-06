Put the staging app's `GoogleService-Info.plist` here (Firebase → add an iOS app
with bundle id `io.swissmonkey.chatstaging` → download its config).

It is not part of the Xcode project on purpose: the "Check web bundle environment"
build phase copies it over the production one, only in the Staging configuration.
