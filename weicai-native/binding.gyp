{
  "targets": [
    {
      "target_name": "weicai-native",
      "sources": [ "*.cc" ],
      "include_dirs": [
        "<!(node -e \"require('nan')\")"
      ]
    }
  ]
}