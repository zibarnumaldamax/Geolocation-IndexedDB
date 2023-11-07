// Определение местоположения
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        alert("Геолокация не поддерживается данным браузером.");
    }
}

function showPosition(position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    document.getElementById('coordinates').innerText = `Широта: ${latitude}, Долгота: ${longitude}`;
    window.currentLocation = { latitude, longitude };
}

// Использование IndexedDB для хранения данных
var db;
var request = indexedDB.open("commentsDB", 1);

request.onerror = function(event) {
    console.log("Ошибка при открытии базы данных");
};

request.onsuccess = function(event) {
    db = event.target.result;
    displayComments();
};

request.onupgradeneeded = function(event) {
    var db = event.target.result;
    var objectStore = db.createObjectStore("comments", { keyPath: "id", autoIncrement: true });
    objectStore.createIndex("comment", "comment", { unique: false });
    objectStore.createIndex("latitude", "latitude", { unique: false });
    objectStore.createIndex("longitude", "longitude", { unique: false });
};

function saveData() {
    var comment = document.getElementById('comment').value;
    var latitude = window.currentLocation.latitude;
    var longitude = window.currentLocation.longitude;

    var transaction = db.transaction(["comments"], "readwrite");
    var objectStore = transaction.objectStore("comments");
    var request = objectStore.add({ comment, latitude, longitude });

    request.onsuccess = function(event) {
        displayComments();
        document.getElementById('comment').value = "";
    };
}

function displayComments() {
    var transaction = db.transaction(['comments'], 'readonly');
    var objectStore = transaction.objectStore('comments');
    var cursor = objectStore.openCursor();

    var commentList = document.getElementById('commentList');
    commentList.innerHTML = "<h2>Сохраненные комментарии:</h2>";

    cursor.onsuccess = function(event) {
        var cursor = event.target.result;
        if (cursor) {
            var comment = cursor.value.comment;
            var latitude = cursor.value.latitude;
            var longitude = cursor.value.longitude;
            commentList.innerHTML += `<p>${comment} (Широта: ${latitude}, Долгота: ${longitude})</p>`;
            cursor.continue();
        }
    };
}