var animEndEventNames = {
        'WebkitAnimation' : 'webkitAnimationEnd',
        'OAnimation' : 'oAnimationEnd',
        'msAnimation' : 'MSAnimationEnd',
        'animation' : 'animationend'
        };
    
    // animation end event name
    var animEndEventName = animEndEventNames[ Modernizr.prefixed( 'animation' ) ];

    var NOTIFICATION_SHOWN = 0;
    var LAUNCH_FROM_NOTIFICATION = 1;
    var DEFAULT = 2;
    var SECRET_SCREEN = 3;

    var exports = {};

    var currentState;
    var animating = false;

    function changeState(newState, animateForward) {
        if(animating || (newState == currentState)) {
            return;
        }

        var currentPage = document.querySelector('.current-page');
        var newUI;

        var animCurrent = animateForward ? 'animate-to-left' : 'animate-to-right';
        var animNew = animateForward ? 'animate-from-right' : 'animate-from-left';

        var hash;

        switch(newState) {
            case NOTIFICATION_SHOWN:
                newUI = getNotifcationArrow();
                hash = 'notification-shown';
            break;
            case LAUNCH_FROM_NOTIFICATION:
                newUI = getLaunchFromNotificationUI();
                hash = 'notification-launch';
            break;
            case DEFAULT:
                newUI = getDefaultUI();
                hash = '';
            break;
            case SECRET_SCREEN:
                animCurrent = 'animate-to-right';
                animNew = 'animate-from-left';
                newUI = getSecretUI();
                hash = 'secret';
            break;
        }

        newUI.classList.add('current-page');

        if(currentPage) {
            // We need to animate
            animating = true;

            currentPage.classList.add(animCurrent);
            newUI.classList.add(animNew);

            currentPage.addEventListener(animEndEventName, pageAnimationEnd(currentPage, newUI, animCurrent, animNew), false);
        }

        currentState = newState;

        pushState({}, "", hash);
    }

    function pageAnimationEnd(currentPage, newPage, animCurrent, animNew) {
        var animEndFunc = function() {
            currentPage.removeEventListener(animEndEventName, animEndFunc, false);

            currentPage.classList.remove(animCurrent);
            newPage.classList.remove(animNew);

            currentPage.classList.remove('current-page');

            animating = false;
        };
        return animEndFunc;
    }

    function getNotifcationArrow() {
        return document.querySelector('.notification-opened');
    }

    function getLaunchFromNotificationUI() {
        return document.querySelector('.launched-from-notification');
    }

    function getDefaultUI() {
        return document.querySelector('.init-screen');
    }

    function getSecretUI() {
        return document.querySelector('.secret-screen');
    }

    function initViews() {
    	var showNotificationBtn = document.querySelector('#show-notification-btn');
    	showNotificationBtn.addEventListener('click', function() {
    		if(window.NotificationBind) {
    			NotificationBind.showNotification('This is an Awesome notification');
    		}

    		changeState(NOTIFICATION_SHOWN, true);
    	});
    }

    function updateUI(animateForward) {
        var identifier = window.location.hash;
        var state;
        
        if(identifier == '#notification-launch') {
            state = LAUNCH_FROM_NOTIFICATION;
        } else if(identifier == '#notification-shown') {
            state = NOTIFICATION_SHOWN;
        } else if(identifier == '#secret') {
            state = SECRET_SCREEN;
        } else {
            state = DEFAULT;
        }

        changeState(state, animateForward);
    }

    function showSecretMessage() {
        var ui = getSecretUI();
        if(ui.classList.contains('current-page')) {
        	if(animating) {
        		return;
        	}
            window.history.back();
        } else {
            changeState(SECRET_SCREEN);

            return 'You Found the Secret';
        }
    }

    function pushState(state, title, path) {
        if(!path) {
            return;
        }

        window.location.hash = path;
    }

window.onload = function() {
    initViews();
};

window.onpopstate = function(event) {
    var popped = document.querySelector('.current-page') ? true : false;
    if(popped && currentState == SECRET_SCREEN) {
        popped = false;
    }
    updateUI(!popped);
};
