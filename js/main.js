(function() {

  var regex_morse_ascii_array = [];
  var regex_morse_ascii = null;

  var results_nice_ascii_text = $("#convert_results_nice_ascii").text();
  var results_default_ascii_text = $("#convert_results_default_ascii").text();

  var envelope;


  var wordplay_interval = null, wordplay_delay = null, word_delay_time = 0;
  function play_morse_code() {
    if($("#text_or_morse").val().trim() !== "") {
      let morse_code = $("#convert_results_nice_ascii").val();
      //console.log(`'${get_morse_code_seperator()}'`);
      if(get_morse_code_seperator().trim() === "|" || get_morse_code_seperator().trim() === "/") {
        morse_code = morse_code.replace(new RegExp(" [" + get_morse_code_seperator().trim() + "] ", "g"), "|");
      } else {
        morse_code = morse_code.replace(new RegExp(get_morse_code_seperator(), "g"), "|");
      }

      //console.log(morse_code);
      let morse_letters = morse_code.split(" ");
      let morse_to_play = [];

      $.each(morse_letters, function(key, word) {
        morse_to_play.push(word.split(""));
      });

      let time_interval = 0;
      $.each(morse_to_play, function(key_l, letter) {
        $.each(letter, function(key_d, dot) {
          let current_dot = dot;
          let time_length = 150;

          if(current_dot !== "|") {
            if(current_dot === "−") time_length = 500;
            setTimeout(function() {
              //console.log(key_l + ": " + current_dot + " (" + time_length + ")");
              //envelope.triggerRelease();
              envelope.triggerAttack();
              setTimeout(() => { envelope.triggerRelease(); }, time_length);
            }, time_interval);
            time_interval += (250 + time_length);
          } else {
            time_interval += 1000;
          }
        });

        time_interval += 500;
      });
    } else {
      console.log("No text entered, so nothing to play!");
    }
  }



  function test_text_for_morse(text) {
    var contains_morse = regex_morse_ascii.test(text);
    var contains_other_chars = new RegExp("[a-z]|[0-9][äåö,?'!/()&:;=+_$@]", "gi").test(text);
    return (contains_morse === true && contains_other_chars === false ? true : false);
  }

  function get_morse_code_seperator() {
    var selected_seperator = $("#morse_code_seperator").val();
    if(selected_seperator === "five_spaces") return "     ";
    else if(selected_seperator === "pipe") return " | ";
    else if(selected_seperator === "slash") return " / ";
    else return "     ";
  }



  if(regex_morse_ascii === null) {
    $.each(morse_alphabet, function(key, alphabet_char) {
      regex_morse_ascii_array.push(alphabet_char.morse);
    });
    regex_morse_ascii = "[" + regex_morse_ascii_array.join("]|[") + "]";
    regex_morse_ascii = regex_morse_ascii.replace("[]", "");
    if(regex_morse_ascii === "") regex_morse_ascii = null;
    regex_morse_ascii = new RegExp(regex_morse_ascii, "gi");
  }





  $("body").on("input paste propertychange", "#text_or_morse", function(event) {

    var inputThis = this;
    var inputVal = $(inputThis).val().trim();
    var inputValLength = inputVal.length;
    var output = [], nice_ascii_output = "", default_ascii_output = "";

    var default_ascii_to_nice_ascii = "";
    var converting_to_morse = true;


    if(inputVal !== "") {
      default_ascii_to_nice_ascii = inputVal.replace(/[-]/gi, "−").replace(/[.]/gi, "•");

      if(regex_morse_ascii === null) {
        $.each(morse_alphabet, function(key, alphabet_char) {
          regex_morse_ascii_array.push(alphabet_char.morse);
        });
        regex_morse_ascii = "[" + regex_morse_ascii_array.join("]|[") + "]";
        regex_morse_ascii = regex_morse_ascii.replace("[]", "");
        if(regex_morse_ascii === "") regex_morse_ascii = null;
        regex_morse_ascii = new RegExp(regex_morse_ascii, "gi");

        if(test_text_for_morse(default_ascii_to_nice_ascii)) converting_to_morse = false;
        else converting_to_morse = true;
      } else {
        if(test_text_for_morse(default_ascii_to_nice_ascii)) converting_to_morse = false;
        else converting_to_morse = true;
      }


      /*
            console.log("Text contains morse code: " + (converting_to_morse ? "false" : "true"));
            console.log(default_ascii_to_nice_ascii);
            console.log("========================================");
            */


      if(converting_to_morse) {

        for(var i = 0; i < inputValLength; i++) {
          var foundChar = inputVal[i].toLowerCase();
          if(foundChar === " ") {
            if(output[(output.length - 1)] !== "|") output.push("|");
          } else {
            $.each(morse_alphabet, function(key, alphabet_char) {
              if(alphabet_char.char === foundChar) {
                output.push(alphabet_char.morse);
              }
            });
          }
        }


        $("#convert_results_nice_ascii").text(results_nice_ascii_text);
        $("#convert_results_default_ascii_container").stop().slideDown(250);
        $("#morse_code_audio p").stop().slideDown(250);

        var default_output = output;
        nice_ascii_output = default_output.join(" ").split(" | ").join(get_morse_code_seperator());
        default_ascii_output = default_output.join(" ").replace(/[−]/gi, "-").replace(/[•]/gi, ".").split(" | ").join(get_morse_code_seperator());
        $("#convert_results_nice_ascii").val(nice_ascii_output);
        $("#convert_results_default_ascii").val(default_ascii_output);

      } else {

        var ascii_output_array = [];
        var ascii_morse_array = default_ascii_to_nice_ascii.replace(/[ ]{2,}|([ ]+\/[ ]+)|([ ]+\|[ ]+)/gi, "|").split("|");

        $.each(ascii_morse_array, function(word_key, morse_word) {
          var morse_chars = morse_word.split(" ");
          ascii_output_array[word_key] = "";

          $.each(morse_chars, function(key, morse_char) {
            $.each(morse_alphabet, function(key, alphabet_char) {
              if(alphabet_char.morse === morse_char) {
                ascii_output_array[word_key] += alphabet_char.char;
              } else {
                //ascii_output_array[word_key] += "*?*";
              }
            });
          });
        });

        /*
              console.log(default_ascii_to_nice_ascii);
              console.log(ascii_output_array);
              */


        $("#convert_results_nice_ascii").text("Results");
        $("#convert_results_default_ascii_container").stop().slideUp(250, function() {
          $("#convert_results_default_ascii").val("");
        });
        $("#morse_code_audio p").stop().slideUp(250);

        $("#convert_results_nice_ascii").val(ascii_output_array.join(" "));

      }
    } else {
      $("#morse_code_audio p").stop().slideUp(250);
      $("#convert_results_nice_ascii").val("");
      $("#convert_results_default_ascii").val("");
    }

  });





  $("body").on("change", "#morse_code_seperator", function(event) {

    var inputVal = $("#text_or_morse").val().trim();
    var inputValLength = inputVal.length;
    var output = [], nice_ascii_output = "", default_ascii_output = "";

    var default_ascii_to_nice_ascii = "";
    var converting_to_morse = true;

    if(inputVal !== "") {
      default_ascii_to_nice_ascii = inputVal.replace(/[-]/gi, "−").replace(/[.]/gi, "•");

      if(regex_morse_ascii === null) {
        $.each(morse_alphabet, function(key, alphabet_char) {
          regex_morse_ascii_array.push(alphabet_char.morse);
        });
        regex_morse_ascii = "[" + regex_morse_ascii_array.join("]|[") + "]";
        regex_morse_ascii = regex_morse_ascii.replace("[]", "");
        if(regex_morse_ascii === "") regex_morse_ascii = null;
        regex_morse_ascii = new RegExp(regex_morse_ascii, "gi");

        if(test_text_for_morse(default_ascii_to_nice_ascii)) converting_to_morse = false;
        else converting_to_morse = true;
      } else {
        if(test_text_for_morse(default_ascii_to_nice_ascii)) converting_to_morse = false;
        else converting_to_morse = true;
      }


      /*
            console.log("Text contains morse code: " + (converting_to_morse ? "false" : "true"));
            console.log(default_ascii_to_nice_ascii);
            console.log("========================================");
            */


      if(converting_to_morse) {

        for(var i = 0; i < inputValLength; i++) {
          var foundChar = inputVal[i].toLowerCase();
          if(foundChar === " ") {
            if(output[(output.length - 1)] !== "|") output.push("|");
          } else {
            $.each(morse_alphabet, function(key, alphabet_char) {
              if(alphabet_char.char === foundChar) {
                output.push(alphabet_char.morse);
              }
            });
          }
        }


        $("#convert_results_nice_ascii").text(results_nice_ascii_text);
        $("#convert_results_default_ascii_container").stop().slideDown(250);
        $("#morse_code_audio p").stop().slideDown(250);

        var default_output = output;
        nice_ascii_output = default_output.join(" ").split(" | ").join(get_morse_code_seperator());
        default_ascii_output = default_output.join(" ").replace(/[−]/gi, "-").replace(/[•]/gi, ".").split(" | ").join(get_morse_code_seperator());
        $("#convert_results_nice_ascii").val(nice_ascii_output);
        $("#convert_results_default_ascii").val(default_ascii_output);

      }
    }

  });



  $("body").on("click", ".output_cont textarea", function(event) {
    $(this).focus();
    $(this).select();
  });



  $("body").on("click", "#morse_code_audio a", function(event) {
    event.preventDefault();

    // morse sound config
    envelope = new Tone.AmplitudeEnvelope({
      "attack" : 0.005,
      "decay" : 0.005,
      "sustain" : 1,
      "release" : 0.2
    }).toMaster();

    //create an oscillator and connect it to the envelope
    var oscillator = new Tone.Oscillator({
      "partials" : [3, 2, 1],
      "type" : "custom",
      "frequency" : "G#4",
      "volume" : -15,
    }).connect(envelope).start();

    play_morse_code();
  });

}());
