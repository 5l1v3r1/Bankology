$(function(){
    $("#header").load("/navbar.html");
});

function loadQuestion(n) {
    $.ajax({
        datatype: "json",
        url: "/quiz",
        data: {
            n: n,
            url: window.location.href.split('/').pop().split('.')[0]
        },
        success: function(data) {
            var question = data.question;
            var answers = data.answers;
            var inputs = '';
            for (i = 0; i < Object.keys(answers).length; i++) {
                inputs += `<input type='radio' name='${question}' id='${i}'></input>
                <label for='${i}'>${answers[i]}</label><br>`;
            }
            $("#quiz").append(`<form action='/quiz' method='POST'>
            <h1>${question}</h1>
            ${inputs}
            <input type='submit' value='Check Answer'>
            </form>`);
        },
        error: function(xhr, status, error) {
            console.log('err');
            console.log(xhr.responseText);
        }
    });
}