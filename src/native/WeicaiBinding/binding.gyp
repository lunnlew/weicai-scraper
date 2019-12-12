{
  "targets": [
    {
      "target_name": "WeicaiBinding",
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
	          			"src/*.cc","src/win/*.cpp"
	        		]
	        	}
        	]
        ]
    }
  ]
}