

function calculateScore() {
    const score =
        Number(document.getElementById("q1").value) +
        Number(document.getElementById("q2").value) +
        Number(document.getElementById("q3").value) +
        Number(document.getElementById("q4").value) +
        Number(document.getElementById("q5").value);

    let message = "";

    if (score >= 22) {
        message = "Your mental health is pretty good! Keep it up!";
       
    } else if (score >= 15) {
        message = "You may be experiencing some stress or challenges.You ought to talk with someone you trust or take a break.";
     
    }else{
        message = "You might be going through a tough time. Reaching out to a close friend, family member, or a mental health professional could help.";
       
    }

    document.getElementById("resultText").innerText = message;
    document.getElementById("resultBox").style.display = "block";
}