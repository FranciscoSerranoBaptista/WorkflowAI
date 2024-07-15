---
id: suggest_exercises
description: Suggest suitable exercises from the "Street Smart" book by Heidi Gutekunst based on survey data and prior analysis.
temperature: 0.7
maxTokens: 4096
---
You are tasked with selecting and sequencing the best exercises from the book "Street Smart" by Heidi Gutekunst that would be ideally suited for a client based on survey data and prior analysis. Follow these steps:

1. Carefully review the data from the user interaction

2. Analyze the exercises from the "Street Smart" exercise collection:

| Theme | Exercise | Description | Use Case | Dominant Action Logics |
|-------|----------|-------------|----------|------------------------|
| Embodiment & Awareness | Quiet and Mindlessness | Taking time alone in a quiet place to just be, without doing anything | Centering, gaining perspective, reflecting | Diplomat, Expert |
| Embodiment & Awareness | Breathing Magic Part 1 | Directing awareness to the breath, using your name as a mantra | Boosting self-esteem, becoming present, dealing with stage fright | Expert, Achiever |
| Embodiment & Awareness | Breathing Magic Part 2 | Breath of Fire kundalini yoga breathing practice | Shifting energy, zooming in/out perspective | Expert, Achiever |
| Embodiment & Awareness | Morning Salutations | Committing to a morning practice like sun salutations, walking, meditation, journaling, or headstand | Building discipline and awareness of the body's communication | Expert, Achiever |
| Embodiment & Awareness | Mindfulness & Meditation to Manage Anxiety | Daily mindfulness meditation practice to address anxiety/stress | Reducing anxiety in challenging situations | Expert, Individualist |
| Embodiment & Awareness | Embodiment - Noticing the Body | Body scan to connect with bodily sensations and gain information | Making decisions, preparing for difficult conversations, noticing projections | Individualist, Strategist |
| Reflection & Inquiry | Reflective Journaling | Stream of consciousness writing practice to reflect and learn | Sorting thoughts, making connections, capturing ideas, setting intentions | Achiever, Individualist |
| Difficult Conversations | Speaking from the Heart | Speaking authentically without a script, sharing personal experiences | Inspiring others, building connection, establishing leadership presence | Achiever, Individualist |
| Awareness & Perspective | 3-2-1 | Viewing a situation from 3rd, 2nd and 1st person perspectives | Gaining objectivity, understanding others, inquiring into patterns | Individualist, Strategist |
| Balancing Action | All Centres Workout | Shifting between intellectual, physical and emotional activities | Stimulating the whole self, integrating, optimal performance | Achievist, Individualist |
| Shadow & Projection | Reclaiming Your Projections | Writing a letter to a difficult person, then swapping their name for yours | Owning projections, understanding relationship dynamics | Individualist, Strategist |
| Awareness & Inquiry | Detachment | Repeatedly asking "Who is this for?" about bothersome thoughts/emotions | Breaking negative thought patterns, finding peace and freshness | Individualist, Strategist |
| Perspective Shifting | First time/Last time | Imagining an activity is being done for the first and last time | Raising alertness, appreciation and energy for routine tasks | Expert, Achiever |
| Perspective & Polarity | Power of Yes/Power of No | Examining colliding perspectives in a difficult question or decision | Embracing complexity, opening to new possibilities | Individualist, Strategist |
| Reflection & Gratitude | Jar of Memories | Collecting mementos of successful actions toward a goal | Making successes visible, generating ideas, identifying patterns | Achiever, Individualist |
| Resilience & Learning | The Juice of Life | Intentionally seeking aesthetic experiences that inspire 'goosebumps' | Sparking creativity, shifting mood, gaining perspective | Individualist, Strategist |
| Presence & Focus | Reset Button - Silence | Starting meetings with 1-3 minutes of silence | Becoming present, focusing on the moment/topic at hand | Achiever, Individualist |
| Intention Setting | Beginnings | Ritual openings for gatherings - silence, check-ins, stories, movement | Acknowledging participants, preparing for purpose, transitioning | Achiever, Individualist |
| Presence & Focus | Mindful Minute | Counting breaths for one minute as a group | Calming agitated individuals/groups, centering between topics | Achiever, Individualist |
| Accessing Wisdom | The Way of the Shaman | Following 4 principles in difficult conversations: show up, be present, tell truth, detach from outcomes | Standing up for self, speaking authentically, accepting what happens | Individualist, Strategist |
| Teamwork & Trust | Evening Gratitude Circle | Nightly family/team circle sharing gratitude and appreciation | Building connection, shifting to positive focus, calming for sleep | Achiever, Individualist |
| Relationship Depth | Cultivating Eros-Infused Friendship | Engaging in deep relational practices like check-ins, inquiry, and appreciation | Transforming dynamics between men and women, colleagues, friends | Individualist, Strategist |
| Communication & Collaboration | LEGO Serious Play | Using LEGO builds to share perspectives on a question or issue | Accessing insights, finding shared understanding and actions | Achiever, Individualist |
| Closing & Completion | Endings and Check-Outs | Closing meetings with silence, appreciations, or ceremonial activities | Providing closure, recognizing contributions, transitioning out | Achiever, Individualist |
| Systemic Awareness | Silence in the System | Holding silence to listen to the 'music' of a system's activities | Noticing rhythms and harmonies, identifying interventions | Strategist, Alchemist |
| Systemic Awareness | Clearing and Cleaning the Space | Attentively preparing meeting spaces, physically and energetically | Creating an atmosphere conducive to the gathering's purpose | Individualist, Strategist |
| Systemic Change | Open Space Technology | Participant-driven meeting format for working on complex issues | Empowering self-organization, surfacing important topics | Strategist, Alchemist |
| Systemic Perspective | Feeling Responsibility & Accountability | Comparing somatic sensations of responsibility vs accountability | Discerning what's yours to do, setting boundaries, empowering others | Individualist, Strategist |
| Facilitation & Participation | Four Parts of Speech | Structuring communication using Framing, Advocating, Illustrating, Inquiring | Improving meeting efficiency, inviting engagement | Achiever, Individualist |
| Visioning & Strategy | Four Territories: Vision, Strategy, Actions, Outcomes | Articulating big picture, key strategies, short-term actions, and outcomes | Providing direction, aligning teams, reviewing progress | Achiever, Individualist |
| Storytelling & Inspiration | Leadership Narratives: Self, Us, Now | Telling stories of personal calling, group identity, and urgent challenges | Establishing credibility, building community, galvanizing change | Individualist, Strategist |
| Effective Communication | Street Smart Listening | Developing listening practices like repetition, visualization, and presence | Improving understanding, connection and collaboration | Individualist, Strategist |
| Storytelling & Inspiration | Storytelling to Connect & Inspire | Using stories about self, others, and imagination to illustrate key messages | Helping others relate, demonstrating values, conveying vision | Achiever, Individualist |
| Facilitation Mastery | Combining Practices for Meetings | Integrating presence, four parts of speech, pacing, and Inquiry-in-Action | Handling complex meeting dynamics, making quality decisions | Strategist, Alchemist |
| Systemic Thinking | Working with Systems | Mapping system context, connections, patterns and perspectives | Seeing relationships between parts, revealing intervention points | Strategist, Alchemist |
| Overcoming Bias | Playing with Polarity & Avoiding Bias | Listening for unstated polarities in discussions and mapping them | Considering fuller range of options, noticing bias and blind spots | Individualist, Strategist |
| Timely Action | Throwing Your Cap Over the Wall | Visibly committing to change before knowing 'how', then following through | Shifting mindsets, creating openings for transformation | Individualist, Strategist |
| Decision Making & Accountability | Doing What You Say You Will Do | Reflecting on accountability -- yours and others' -- when making commitments | Building trust, focusing action, developing responsibility | Achiever, Individualist |


3. Based on the survey data, prior analysis, and book contents:
   a) Select 3-5 exercises from the book that would be most beneficial for the client
   b) Determine an optimal sequence for these exercises

4. For each selected exercise:
   a) Explain why it was chosen
   b) Describe how it addresses specific needs or areas for improvement identified in the survey data and prior analysis

5. Provide a rationale for the overall sequence of exercises

6. Present your recommendations in the following markdown H2, H3, H4, paragraps and bullet format:

## Recommendations
1. [Exercise Name]
   - Reason for selection:
   - How it addresses client needs:

2. [Exercise Name]
   - Reason for selection:
   - How it addresses client needs:

[Continue for all selected exercises]

## Sequence Rationale:
[Explain the reasoning behind the order of exercises]

Ensure your recommendations are tailored to the specific needs and context of the client as indicated in the survey data and prior analysis.
