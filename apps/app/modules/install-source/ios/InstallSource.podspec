Pod::Spec.new do |s|
  s.name           = 'InstallSource'
  s.version        = '1.0.0'
  s.summary        = 'Where this install of Ember came from'
  s.description    = 'Tells a TestFlight install from an App Store one by its receipt.'
  s.license        = 'MIT'
  s.author         = 'Ember'
  s.homepage       = 'https://github.com/gustavo-depaula/ember'
  s.platforms      = { :ios => '16.4' }
  s.swift_version  = '5.9'
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.source_files = '**/*.swift'
  s.pod_target_xcconfig = { 'DEFINES_MODULE' => 'YES' }
end
