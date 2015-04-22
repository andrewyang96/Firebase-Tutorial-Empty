var bodyTemplateSrc = $("#body-template").html();
var bodyTemplate = Handlebars.compile(bodyTemplateSrc);
var username = "Guest";

var root = new Firebase("https://andrewyang.firebaseio.com/");
var chatRoom = root.child("chat");
var avatarUrl = "https://lh3.googleusercontent.com/-_wSkui7ZO0Y/AAAAAAAAAAI/AAAAAAAAAEw/1wdJ7XRJiMw/s46-c-k-no/photo.jpg";

var messages = {};

$(document).ready(function () {
	attemptLogin();
	renderTemplate();
	setupMessageLoader();
});

function attemptLogin() {
	var user = root.getAuth();
	if (user) {
		loginWithAuthData(user);
	}
}

function setupMessageLoader() {
	chatRoom.on("value", function (snapshot) { // anytime there's an update
		var newMessages = snapshot.val(); // get updated data
		messages = newMessages;
		renderTemplate(); // re-render template
	});
}

function renderTemplate() {
	var context = {
		username: username,
		messages: messages
	};
	var renderedTemplate = bodyTemplate(context);
	$("#body-template-view").html(renderedTemplate);
	setupTemplateListeners();
}

function setupTemplateListeners() {
	$("#chat-box").keypress(function (e) {
		if (e.which == 13) { // Enter key pressed
			var message = $("#chat-box").val(); // get input box's contents
			sendMessage(message);
			$("#chat-box").val(""); // reset input box
		}
	});

	$("#fb-login").click(function () {
		root.authWithOAuthPopup("facebook", function (err, authData) {
			loginWithAuthData(authData);
		});
	});
}

function loginWithAuthData(authData) {
	username = authData.facebook.displayName;
	avatarUrl = authData.facebook.cachedUserProfile.picture.data.url;
	renderTemplate();
}

function sendMessage(msgText) {
	// avatar, username, content
	chatRoom.push({
		avatarUrl: avatarUrl,
		username: username,
		msgText: msgText,
		timestamp: Firebase.ServerValue.TIMESTAMP
	});
}

Handlebars.registerHelper("getDateString", getDateString);
function getDateString(timestamp) {
	return moment(new Date(timestamp)).fromNow();
}