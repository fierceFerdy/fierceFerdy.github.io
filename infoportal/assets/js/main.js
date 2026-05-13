// Review popup
document.querySelectorAll('.reviews .readMore').forEach((el) => {

    el.addEventListener('click', function(e){
        
        var interviewContent = e.target.nextElementSibling.innerHTML;
        var popupWrapper = document.querySelector('.popupWrapper');
        var popupLocation = document.querySelector('.popup .content');
    
        popupWrapper.classList.add('visible');
        popupLocation.innerHTML = interviewContent;
    
    });

});

// Close review popup
document.querySelector('.popupWrapper .close').addEventListener('click', function(){
    document.querySelector('.popupWrapper').classList.remove('visible');
});