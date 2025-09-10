const button = document.getElementById("button");

button.addEventListener("click", () => {
    Notification.requestPermission().then(permission => {
        if (permission) {
            new Notification("Hello, World!");
        }
    })
})