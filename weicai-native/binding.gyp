{
  "targets": [
    {
      "target_name": "weicai-native",
      "sources": [],
      "include_dirs": [
        "<!(node -e \"require('nan')\")"
      ],
      "conditions": [
      		[
      			"OS=='win'", 
	      		{
	        		"defines": [],
	        		"sources": [
	          			"src/win/*.cc","src/win/*.cpp"
	        		]
	        	}
        	]
        ]
    }
  ]
}