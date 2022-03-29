var SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
if ('SpeechRecognition' in window) {
    const recognition = new SpeechRecognition();
    console.log('established');
} else {
    console.log('failed to have speech recognition');
}

function speechToText() {
const recognition = new SpeechRecognition();
  recognition.start();

  recognition.onresult = (event) => {
    const speechToText = event.results[0][0].transcript;
    console.log(speechToText);
    document.getElementById("searchbar").value = speechToText;
  }
}

function textSearch() {
    var searchText = document.getElementById('searchbar');
    if (searchText.value == "") {
        alert('Invalid input!');
    } else {
        searchText = searchText.value.trim().toLowerCase();
        console.log('Searching');
        searchPhotos(searchText);
    }
    
}

function searchPhotos(searchText) {

    console.log(searchText);
    document.getElementById('photos_search_results').innerHTML = "<h4 style=\"text-align:center\">";

    var params = {
        'q' : searchText
    };
    
    apigClient.searchGet(params, {}, {})
        .then(function(result) {
            console.log("Result : ", result);

            image_paths = result["data"];
            console.log("image_paths : ", image_paths);

            var photosDiv = document.getElementById("photos_search_results");
            photosDiv.innerHTML = "";

            var n;
            for (n = 0; n < image_paths.length; n++) {
                images_list = image_paths[n].split('/');
                console.log(images_list)
                image_name = images_list[images_list.length - 1];
                console.log(image_name)

                photosDiv.innerHTML += '<figure><img src="' + image_paths[n] + '" style="width:25%"><figcaption>' + image_name + '</figcaption></figure>';
            }

        }).catch(function(result) {
            console.log(result);
        });
}


function uploadPhoto() {
    var filePath = (document.getElementById('uploaded_file').value).split("\\");
    var fileName = filePath[filePath.length - 1];
    console.log(fileName);
    
    var customLabels = document.getElementById('custom_labels').value;
    console.log(customLabels)

    var file = document.getElementById('uploaded_file').files[0];
    console.log('File : ', file);
    document.getElementById('uploaded_file').value = "";
    document.getElementById('custom_labels').value = "";

    if ((filePath == "") || (!['png', 'jpg'].includes(fileName.split(".")[1]))) {
        alert("Invalid file!");
    } else {

        var params = {
            'item': fileName,
            'folder': 'b2photosbucket',
            'Content-Type': file.type,
            'x-amz-meta-customLabels': customLabels
        };
        var additionalParams = {
            'headers': {
                'Access-Control-Allow-Origin': '*'
            }
        };
        
        var reader = new FileReader();
        reader.onload = function (event) {
            body = btoa(event.target.result);
            console.log('Reader body : ', body);
            return apigClient.uploadFolderItemPut(params, body, additionalParams)
            .then(function(result) {
                console.log(result);
            })
            .catch(function(error) {
                console.log(error);
            })
        }
        reader.readAsBinaryString(file);
    }
}
