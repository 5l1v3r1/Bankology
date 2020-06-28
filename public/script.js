$(function() {
  $("header").load("/navbar.html", function() {
    if (document.cookie.split("id=").pop() != "") {
      $("#login").attr("onclick", "window.location = '/logout'");
      $("#login").text("Logout");
    }
  });
  $("footer").load("/footer.html");
});

function loadQuestion(n) {
  $("#quiz").append(`
  <h1> Loading... </h1>
  `)
  var url = window.location.href.split('/').pop().split('.')[0];
  $.ajax({
    datatype: "json",
    url: "/quiz",
    data: {
      n: n,
      url: url
    },
    success: function(data) {
      $("#quiz").empty()
      if(data.none){
        $("#quiz").append(`
          <h1>Congrats</h1>
          <p>You reached the end</p>
        `)
        return
      }
      if(data.alreadyAnswered){
        loadQuestion(n+1);
        return
      }
      var question = data.question;
      var answers = data.answers;
      var inputs = '';
      
      inputs += `<input type='hidden' name='id' value='${n}'>`
      inputs += `<input type='hidden' name='name' value='${url}'>`
      for (i = 0; i < Object.keys(answers).length; i++) {
        inputs += `<input type='radio' name='answer' id='${i}' value='${i}'></input>
        <label for='${i}'>${answers[i]}</label><br>`;
      }
      inputs += `<p id='message'></p>`
      $("#quiz").append(`<form action='/quiz' method='POST'>
      <h1>${question}</h1>
      ${inputs}
      <input type='submit' value='Check Answer'>
      </form>
      <button id='nextQuestion' onclick='loadQuestion(${n+1})' hidden> Next Question </button>
      `);
      $("form").submit(function(e) {
        e.preventDefault();
        form = $(this);
        $.ajax({
          type: form.attr("method"),
          url: form.attr("action"),
          data: form.serialize(),
          success: function(data) {
            if (data.incorrect || data.error) {
              $("form").children("input:checked").next().addClass('incorrect')
              document.getElementById('message').innerText = data.explanation
            } else {
              $("form").children("input:checked").next().addClass('correct')
            }
            $("input").prop('disabled', true)
            $("#nextQuestion").removeAttr('hidden');
          }
        });
      });
    },
    error: function(xhr, status, error) {
      console.error(xhr)
      console.error(error)
    }
  });
}

