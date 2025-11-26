function send() {
    const title = document.getElementById("title").value;
    const message = document.getElementById("message").value;

    fetch("/api/sendToAll", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({title, message})
    }).then(() => alert("Notification sent successfully!"))
    .catch((err) => alert("Error: " + err));
}
