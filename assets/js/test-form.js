// When the submit button is clicked in a .test-form, check the answers (in the html) and mark the input fields as .correct or .incorrect.

var forms = document.querySelectorAll('.test-form');

forms.forEach(form => {

	form.addEventListener('submit', function(e) {
		e.preventDefault();

		var answers = JSON.parse(form.querySelector('script[type="application/json"]').textContent).answers;
		var inputs = form.querySelectorAll('input[type="text"]');

		inputs.forEach(input => {
			var qNumber = input.name.split('-');
			var answer = answers[qNumber[2]];

			if (input.value === answer) {
				input.classList.add('correct');
				input.classList.remove('incorrect');
			} else {
				input.classList.add('incorrect');
				input.classList.remove('correct');
			}
		});
	});
});