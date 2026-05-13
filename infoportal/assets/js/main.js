document.querySelectorAll('readMore').forEach((x) => {

    this.addEventListener('click', function(e){
        console.log('click');
        
        var interviewContent = e.nextElement().innerHTML;
        var popupWrapper = document.querySelector('.popupWrapper');
        var popupLocation = document.querySelector('.popup .content');
    
        popupWrapper.classList.add('visible');
        popupLocation.innerHTML = interviewContent;
    
    });

})