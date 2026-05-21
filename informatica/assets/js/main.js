// Review popup
document.querySelectorAll('.reviews .readMore').forEach((el) => {

    el.addEventListener('click', function(e){
        
        var interviewContent = e.target.nextElementSibling.innerHTML;
        var popupWrapper = document.querySelector('.popupWrapper');
        var popupLocation = document.querySelector('.popup .content');
    
        popupWrapper.classList.add('visible');
        popupLocation.innerHTML = interviewContent;

        // Add overlay to body
        document.getElementById('overlay').classList = 'active';
        document.querySelectorAll('.row').forEach((el) => {
            el.classList.add('blurred');
        });
    });

});

// Close review popup
document.querySelector('.popupWrapper .close').addEventListener('click', function(){
    document.querySelector('.popupWrapper').classList.remove('visible');
    document.getElementById('overlay').classList = '';
    document.querySelectorAll('.row').forEach((el) => {
        el.classList.remove('blurred');
    });
});

// Close review popup when pressing ESC
document.addEventListener('keydown', function(e){
	if(e.key === 'Escape'){
		document.querySelector('.popupWrapper').classList.remove('visible');
        document.getElementById('overlay').classList = '';
        document.querySelectorAll('.row').forEach((el) => {
            el.classList.remove('blurred');
        });
	}
});