# Friend Verdict

Yep. Keep the site normal, clean, and straightforward—no corny slogans, confetti, fake “THE GROUP HAS SPOKEN” stuff. Just add pie-chart results.

Create a simple, modern friend-group voting quiz specifically for these 8 people:

Ruben, Rhia, Niya, Zach, Nathan, Josh, Esther, Isha

Quiz

Create exactly 40 questions.

Every question has the same 8 possible answers:

Ruben

Rhia

Niya

Zach

Nathan

Josh

Esther

Isha

Randomize the order of the names for every question.

The questions should be a mixture of positive, negative, funny, random, hypothetical, personality, appearance, friendship, future, and light romantic questions.

Do NOT separate them into categories. Mix all question types together throughout the quiz.

Examples:

Who looks the best?

Who has the best style?

Who is the funniest?

Who is the nicest?

Who is the smartest?

Who is the most trustworthy?

Who gives the best advice?

Who has the best music taste?

Who is most likely to become successful?

Who is most likely to become famous?

Who is most likely to be rich?

Who is the most chaotic?

Who is the most dramatic?

Who is the biggest yapper?

Who is most likely to be late?

Who is worst at replying?

Who is most likely to start an argument?

Who is most likely to embarrass themselves?

Who is most likely to make a terrible decision?

Who would be the best person to go on a road trip with?

Who would be the worst person to go on vacation with?

Who would survive longest in a zombie apocalypse?

Who would accidentally become famous?

Who would make the best leader?

Who would be the best teammate?

Who is the most competitive?

Who is the most caring?

Who is the easiest to talk to?

Who would you trust with a secret?

Who would make the best date?

Who would be the most nervous on a first date?

Who would be the best at flirting?

Who would catch feelings first?

Who would overthink a text from someone they like?

Who would be easiest to make blush?

Who would give the best relationship advice?

Who is most likely to become a millionaire?

Who is most likely to travel the world?

Who would have the craziest future?

Who is most likely to surprise everyone?

Keep romantic questions light and appropriate. Do not include sexual questions.

Make the questions interesting enough that friends will disagree about the answers.

Quiz Interface

Keep the interface simple.

Show:

Question 1 of 40

Then the question and 8 selectable name buttons/cards.

After selecting an answer, allow the player to continue to the next question.

Do not show who selected what.

Results

After each question has been answered by the players, show the results as a pie chart.

The pie chart should show the percentage/share of votes each of the 8 friends received.

Example:

Who looks the best?

[Pie chart]

Ruben — 35%
Rhia — 20%
Niya — 10%
Zach — 15%
Nathan — 5%
Josh — 5%
Esther — 7%
Isha — 3%

Use the actual vote totals to calculate the percentages.

The pie chart should update automatically based on the submitted votes.

Also show the exact number of votes next to each name.

Do not reveal which individual player chose which answer.

Final Results

After all 40 questions, show an overall results page.

Include:

A pie chart showing total votes received by each person across all 40 questions

Total votes for each person

Number of questions each person received the most votes on

Most popular answer overall

Closest/most evenly split question

Most unanimous question

Keep the final results page clean and easy to read.

Anonymous Player System

Use a random anonymous device identifier stored in a privacy-conscious cookie or local storage.

Players should not see their internal ID or anyone else's ID.

Use it to remember:

Their display name

Their progress

Their submitted answers

Their current session

Whether they already answered a question

If they refresh, restore their session and prevent duplicate submissions.

The creator/admin should be able to see the player display names and associated quiz responses in a private admin view, while normal players cannot see who submitted which answers.

Do not collect unnecessary personal information.

Design

Keep the design simple and modern.

Do NOT use:

Cringey slogans

Excessive animations

Confetti

Meme text

Fake game-show language

Over-the-top gradients

Gamified badges

Excessive glassmorphism

Use:

Clean dark/light modern interface

Simple typography

Rounded buttons

Subtle animations

Clear spacing

Responsive mobile layout

Clean pie charts

Minimal visual clutter

The website should feel like a normal polished quiz website with a slightly social/friend-group feel.

Prioritize functionality, readability, and the voting/results experience.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://friend-vote-showdown.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/10647099-12a4-47d4-a473-08193d094477).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
