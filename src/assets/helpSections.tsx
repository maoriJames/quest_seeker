import React from 'react'

export type HelpSection = {
  title: string
  paragraphs: React.ReactNode[]
}

export const helpSections: HelpSection[] = [
  {
    title: 'QuestSeeker in a Nutshell',
    paragraphs: [
      <>
        <strong>Treasure Hunt Gameplay:</strong> QuestSeeker is a mobile
        platform that turns fundraising and marketing into interactive
        adventures. It offers family-friendly scavenger hunts (called “Quests”)
        that make fundraising fun. Players use the app to complete a list of
        challenges – for example, taking a photo at a location or answering a
        riddle. Each Quest is a time-bound event with a clear start and end
        date, adding excitement and urgency for participants.
      </>,
      <>
        <strong>Quest Seekers (Participants):</strong> Anyone can join a Quest
        as a “Seeker.” Quest Seekers browse available Quests in the app (by
        name, region, or filters like newest) and can join by paying an entry
        fee or donation if required. Once enrolled, Seekers complete the Quest’s
        tasks by submitting answers (text or photo evidence) through the app.
        It’s an engaging activity that can bring together friends and family in
        friendly competition – “a brilliant way to have some fun and support a
        cause.” Players get a fun, interactive experience and know they’re
        contributing to a meaningful goal at the same time.
      </>,
      <>
        <strong>Quest Creators (Organizers):</strong> Quest Creators design and
        manage the Quests. Non-profits, community groups, businesses, or even
        individuals can all be Quest Creators. The app provides an easy
        Quest-creation workflow to set up challenge tasks, provide clues, and
        review submissions. This allows organizers to tailor each Quest to their
        goals – whether that’s educating players about a cause or promoting a
        brand – “tailor tasks to your creative specifications for optimal fun,
        awareness, and support.” You don’t need technical skills; QuestSeeker
        handles the heavy lifting (like delivering challenges and tracking
        players’ progress) so you can focus on creativity and engagement.
      </>,
      <>
        <strong>Fundraising for Non-Profits:</strong> QuestSeeker is especially
        useful for charities and non-profits. Organizations can charge
        participants an entry fee or suggest a donation to join their Quest,
        turning gameplay into a fundraising campaign. The platform’s pricing is
        very charity-friendly (only a $50 setup fee for non-profits, see Pricing
        & Fees below), ensuring that most funds go toward the cause. Using a
        scavenger hunt format can boost community engagement and donor
        enthusiasm. Participants have “a fun, interactive experience” and learn
        about the cause as they play, which often leads to greater awareness and
        support for your mission.
      </>,
      <>
        <strong>Marketing & Promotion for Businesses:</strong> Companies – from
        large brands to small local shops – can use QuestSeeker as a creative
        marketing tool. Quests let brands “engage with customers in new and
        exciting ways” and “increase brand loyalty” through interactive
        challenges. Businesses can embed their branding into the game and even
        drive foot traffic by including location-based tasks (for example,
        visiting a store or local landmark as part of the hunt). Commercial
        Quest Creators pay a flat fee (depending on participant count) to host
        Quests, and many choose to make entry free for players to maximize
        engagement. The result is a memorable promotional campaign where
        customers have fun and connect with the brand in a positive way.
      </>,
      <>
        <strong>Prizes and Incentives:</strong> To motivate Quest Seekers, Quest
        Creators can offer rewards for participation or completion. Prizes can
        be sponsored by local businesses or donors, which encourages
        cross-promotion and keeps costs low for organizers. For example, a
        sponsor might provide gift cards or coupons to Quest winners. These
        incentives make the game more exciting and attract more participants by
        adding real value to the fun. Quest creators can decide how winners are
        determined – perhaps the fastest finishers, the highest point scorers,
        or random draws among those who complete all tasks. Every Quest can
        optionally have its own mini-rewards, and QuestSeeker’s built-in
        leaderboard keeps track of points to help fairly judge performance if
        speed or points matter.
      </>,
      <>
        <strong>Leaderboards & Friendly Competition:</strong> All Quests feature
        an in-app competitive element – players earn points for joining Quests,
        completing tasks, and finishing Quests. Quest Seekers appear on a global
        QuestSeeker leaderboard, and every year special prizes are given to the
        highest-ranking Quest Seekers across all events before all scores are
        reset for the next year. This ongoing competition adds an extra layer of
        excitement, encouraging people to participate in multiple Quests and try
        their best in each adventure.
      </>,
    ],
  },
  {
    title: 'How to Participate as a Quest Seeker (Step-by-Step)',
    paragraphs: [
      <>
        <strong>
          Joining a QuestSeeker adventure is easy and enjoyable. As a Quest
          Seeker, here’s how you can get started and make the most of the
          experience:
        </strong>
      </>,
      <>
        <strong>Sign Up to the QuestSeeker App:</strong> Get the app on your
        smartphone or tablet by saving the app to your homescreen on ios or
        Android via your browser (chrome, safari etc.) and then create your free
        account. Once logged in, you can browse the app to see available Quests.
        Quests are listed by name or region, and you can sort by title (A–Z) or
        by start date (newest to oldest). Feel free to explore upcoming and
        ongoing Quests to find one that interests you.
      </>,
      <>
        <strong>Find and Join a Quest:</strong> Look through the list of current
        Quests and choose one that catches your interest. Each Quest listing
        will show details like the hosting organization or sponsor, the start
        and end dates, the number of tasks, the location/region, and any entry
        fee or suggested donation. If it’s a non-profit fundraiser, you’ll
        likely be prompted to pay a small entry fee or donation to join (e.g.
        $10–$20, which goes to the cause). For corporate-sponsored Quests, entry
        might be free – the goal there is usually engagement rather than
        fundraising. Once you’ve decided, tap “Join Quest.” If there is a fee,
        you can pay securely through the app (which uses Stripe for payment
        processing). After joining, you’ll be registered as a participant and,
        when the Quest begins, you’ll have access to all its challenges.
      </>,
      <>
        <strong>Complete the Quest Tasks:</strong> Now the adventure begins!
        When the Quest’s start time arrives, the app will reveal the list of
        challenges or clues you need to complete. You can usually do them in any
        order, unless the Quest specifies otherwise. Tasks could be anything
        from answering a trivia question, to submitting a photo as proof of
        finding an item, to checking in at a specific location via GPS. For
        example, you might have to snap a selfie at a historic landmark, solve a
        riddle about local history, or upload a picture of your team performing
        a funny task. Each task will have clear instructions or a clue provided
        by the Quest Creator. Enjoy the process – this is where the exploration
        and family fun really shine! If you’re playing with friends or family,
        you can work together to tackle the tasks (just make sure each person
        submits on their own device if they are registered separately).
      </>,
      <>
        <strong>Submit Answers and Track Your Progress:</strong> Using the app,
        upload your answers for each task as you complete it. This could involve
        typing in a text answer or taking a photo within the app to serve as
        evidence. QuestSeeker will keep you organized: it shows which tasks
        you’ve finished and which are remaining. You can usually revisit the
        task list at any time during the event. The app may also show a progress
        bar or percentage of completion. Some Quests even allow you to see a
        live leaderboard or score tally, so you know how you’re doing compared
        to other Seekers. Don’t worry if some tasks are tricky – you can skip
        around and return to tough ones later as long as the Quest is still
        active. And remember, the goal is to have fun and maybe learn something
        new, so enjoy the journey!
      </>,
      <>
        <strong>Complete the Quest and Enjoy the Rewards:</strong> Try to finish
        as many tasks as you can before the Quest’s end date/time. To officially
        complete the Quest, you typically need to submit all required tasks.
        Once the Quest period ends, no new submissions are accepted. Check the
        app for final results, which will show who managed to complete all tasks
        (and sometimes, how quickly they did so). Only those Seekers who
        completed all tasks will appear on the Quest’s “Completed Quest” page,
        and they might be ranked by finishing order or points earned. After
        you’ve submitted everything, the Quest Creator will review the answers
        (especially for subjective tasks like photo challenges) to validate
        entries. Once approved, winners or top performers will be announced if
        the Quest has prizes. For example, the fastest Seekers might get a
        trophy badge in the app or a sponsored prize like a gift card, and some
        Quests also award random prizes to a few participants just for joining.
        Even if there isn’t a grand prize, everyone’s a winner in a fundraising
        Quest – you’ve had a great time and contributed to a meaningful cause.
        After the Quest, you can often download a summary or certificate of
        completion, or share fun photos from your adventure on social media
        (which also helps spread awareness for the event or cause). Organizers
        will usually send a thank-you message and let you know how much was
        raised for charity. Feel proud – you completed the Quest and made a
        difference in the community!`,
      </>,
    ],
  },
  {
    title: 'How to Create a Quest as a Quest Creator (Step-by-Step)',
    paragraphs: [
      <>
        If you want to design your own treasure hunt event, QuestSeeker offers a
        straightforward toolkit for Quest Creators. Whether you’re a fundraising
        chair for a non-profit or a marketing manager for a business, you can
        set up a custom scavenger hunt and invite people to participate.
        <strong>Here’s how to create a Quest:</strong>
      </>,
      <>
        <strong>Register as a Quest Creator:</strong> Everyone who joins
        QuestSeeker is automatically registered as a Seeker by default. To
        create your own Quest, you’ll need to provide a bit more info. In the
        app menu, select “<strong>Create a Quest.</strong>” The app will prompt
        you to enter additional account details for your organizer profile,
        including:
        <ul className="list-[circle] list-outside pl-5 mt-2 flex flex-col gap-1">
          <li>
            Organization Name: (e.g. your non-profit, community group, or
            company name)
          </li>

          <li>
            Organization Type: (non-profit, school, business, individual, etc.)
          </li>

          <li>
            Registration Number: (if applicable, for charities or companies)
          </li>

          <li>
            Organization Description: (a short blurb about your group or
            mission)
          </li>

          <li>
            Primary Contact Name & Position: (who is organizing, e.g. “Jane Doe
            – Fundraising Chair”)
          </li>

          <li>
            Contact Phone Number: (in case QuestSeeker support or participants
            need to reach you)
          </li>
        </ul>
      </>,
      <>
        Next, you’ll be asked to choose a pricing plan for creating your Quest
        (the cost depends on the type of organization and size of event):
        <ul className="list-[circle] list-outside pl-5 mt-2 flex flex-col gap-1">
          <li>
            <strong>Non-Profit or Personal Fundraiser:</strong> $50.00 flat fee
            to create the Quest, plus a 15% service fee (commission) on any
            entry fees or donations collected through the app. (This small
            commission helps cover payment processing and platform maintenance,
            and the rest of the funds go to your cause.)
          </li>

          <li>
            <strong>Small Business (Commercial Quest):</strong> $299.00 flat
            fee, which covers up to 500 participants. No commission is taken
            from participant entry fees (commercial Quests often are free for
            players anyway, meant for engagement)
          </li>

          <li>
            <strong>Large Business/Enterprise (Commercial Quest):</strong>
            $950.00 flat fee, which covers up to 3000 participants. No
            commission on participant fees. (This tier is ideal for big
            campaigns or city-wide promotional hunts with a large expected
            turnout.)
          </li>
        </ul>
      </>,
      <>
        <i>Why these fees?</i> QuestSeeker’s revenue comes primarily from the
        commission on fundraising Quests’ entry fees. However, many corporate or
        promotional Quests waive entry fees to encourage maximum participation
        (0% commission in those cases). The flat fee structure for businesses
        ensures the platform is supported even if the event is free for players.
        Overall, these fees are modest when compared to the cost of developing a
        custom app or event from scratch, and they help support QuestSeeker’s
        maintenance and customer support while keeping the service accessible.
      </>,

      <>
        <strong>Create a Quest (Basic Details):</strong> Once your organizer
        profile is set up and you’ve chosen the appropriate plan, you can start
        creating your first Quest. Tap “<strong>+ Create a Quest</strong>” from
        the menu to enter the Quest details. You’ll need to provide:
        <ul className="list-[circle] list-outside pl-5 mt-2 flex flex-col gap-1">
          <li>
            <strong>Quest Title:</strong> Give your event a catchy name (e.g.
            “Citywide Charity Quest for Clean Water” or “Mall Treasure Hunt
            Extravaganza”). This will be the first thing participants see.
          </li>
          <li>
            <strong>Cover Image:</strong> Select an attractive image that
            represents your Quest. It could be a logo, a photo related to your
            theme, or any graphic that will grab attention in the Quest listing.
          </li>
          <li>
            <strong>Region/Location:</strong> Specify the general location for
            your Quest. If it’s tied to a specific area (city, park, mall,
            etc.), mention that so players know if they need to be physically
            present. If it can be played from anywhere (e.g. photo challenges
            that can be done at home), you can set the region as “Online” or a
            broad area.
          </li>
          <li>
            <strong>Quest Overview/Description:</strong> Write a brief
            description to attract players. Explain what the Quest is about and
            why it’s exciting. For example, “Join our scavenger hunt to support
            the Animal Rescue Fund – solve clues around town to learn about pets
            and win prizes, all for a good cause!” Make it clear if the event
            supports a charity or if there are any cool prizes or sponsors
            involved. This is your pitch to potential Seekers, so make it
            engaging and informative.
          </li>
          <li>
            <strong>Start and End Date/Time:</strong> Choose when your Quest
            will start and when it will end. You might run a one-day event (e.g.
            a single Saturday from 10 AM to 4 PM) or a longer challenge that
            spans a week or even a month. Participants can only submit answers
            during this window. If your Quest is part of a festival or specific
            day, align the times accordingly. The app will display the Quest as
            “upcoming” before start, “active” during the timeframe, and then it
            will close at the end time.
          </li>
          <li>
            <strong>Participant Requirements (if any):</strong> Most Quests are
            open to all ages by design. If there are any restrictions or
            recommendations (e.g. “Need a car to travel between locations” or
            “Best for ages 12 and up due to puzzle difficulty”), note that in
            the description so players know what to expect.
          </li>
        </ul>
      </>,
      <>
        <strong>Create the Challenges (Task List):</strong> Now craft the fun
        part – the list of tasks or clues that Quest Seekers will have to
        complete. In the QuestSeeker creator interface, you can add challenges
        one by one. For each task, you will set:
        <ul className="list-[circle] list-outside pl-5 mt-2 flex flex-col gap-1">
          <li>
            <strong>Task Type:</strong> Choose the kind of challenge – either a
            question that requires a text answer, a photo task where players
            must upload a picture, or a GPS check-in at a specific location.
            (GPS tasks let you pin a location on a map that players must
            physically visit and “check in” via the app.)
          </li>
          <li>
            <strong>Clue/Instruction:</strong> Write a clue, riddle, or
            instruction for the task. For example: “Take a selfie with the
            town’s founder statue,” or “What year is on the cornerstone of City
            Hall?” or “Find the secret code word hidden on the event poster in
            Central Park.”
          </li>
          <li>
            <strong>Answer (for verification):</strong> If it’s a text or GPS
            task, you’ll provide the correct answer or location for the app to
            verify (photo tasks are manually reviewed later). Text answers can
            be set to accept either an exact match or one of several acceptable
            answers (you can account for spelling variants or keywords).
          </li>
          <li>
            <strong>Points (optional):</strong> You can assign point values for
            each task (e.g. 10 points per task, or more points for harder
            challenges). By default, all tasks could be equal, but sometimes
            giving different points can add extra strategy or fun.
          </li>
          <li>
            <strong>Task Order:</strong> Decide if tasks must be done in order
            or if players can do them in any sequence. Most Quests allow any
            order to keep it flexible, but if your story or game works
            sequentially (Task 2 clue only makes sense after Task 1 is done),
            you can enforce an order.
          </li>
        </ul>
      </>,
      <>
        Aim for a good mix of easy and challenging tasks to keep things
        interesting. Remember, family fun is key, so ensure tasks are
        appropriate and enjoyable for your audience. You might include a few
        educational tasks related to your cause or brand, but keep the tone
        light and adventurous. QuestSeeker will keep all these clues organized
        and accessible to players through the app once your Quest goes live.
      </>,

      <>
        <strong>Set Fundraising & Incentive Options:</strong> If you’re running
        a fundraising Quest, configure the entry fee or required donation for
        participants. You’ll enter the amount each player (or team) needs to
        contribute to join the Quest (for example, $15 per player, which will be
        collected during sign-up). The app will handle collecting these payments
        on your behalf via Stripe, and you’ll receive the funds (minus
        QuestSeeker’s service fee) for your organization. If you’re a charity,
        be sure to communicate how the entry fees will help your cause (players
        like to know their game ticket is making a difference: e.g. “Your $15
        entry will provide a school kit for one child in need.”).
      </>,
      <>
        Next, consider adding prizes or rewards to your Quest to entice
        participants. Quests with prizes tend to attract more players. You can
        set up:
        <ul className="list-[circle] list-outside pl-5 mt-2 flex flex-col gap-1">
          <li>
            <strong>Grand Prize:</strong> e.g. a sponsored product, a gift
            basket, or tickets to an event for the overall winner or top
            finishers.
          </li>
          <li>
            <strong>Secondary Prizes:</strong> e.g. small gift cards, coupons,
            or merchandise for a few runners-up or as random draw prizes.
          </li>
          <li>
            <strong>Completion Reward:</strong> e.g. a digital badge or
            certificate for everyone who finishes all tasks, or maybe a discount
            code from a sponsor as a thank-you.
          </li>
        </ul>
      </>,
      <>
        If you don’t have a budget for prizes, reach out to local businesses or
        supporters to sponsor these rewards. Many will be happy to donate items
        or vouchers in exchange for visibility and goodwill. Sponsored prizes
        not only save you money, but they draw more players — people love the
        chance to win something tangible while doing good. You can acknowledge
        sponsors on the Quest info page and even incorporate them into tasks
        (for example, a clue that leads players to the sponsor’s storefront,
        driving customer traffic there). Be sure to decide how winners will be
        determined: fastest completion, highest points, or random selection
        among those who finish, etc. (Note that QuestSeeker doesn’t
        automatically pick winners for you, but it will provide the data you
        need, like timestamps and scores, to make the decision.)
      </>,
      <>
        <strong>Publish and Promote the Quest:</strong> Once you’ve set up all
        the tasks and details, it’s time to launch your Quest! Review everything
        (you can preview the Quest as a player would see it). When ready, hit “
        <strong>Publish.</strong>” The Quest will go live on the platform,
        appearing in the app’s list of available Quests. If you set a future
        start date, it will be labeled as “Upcoming” until it starts, then
        automatically switch to “Active” during your chosen dates.
      </>,
      <>
        Now, <strong>promote your Quest</strong> to get participants.
        QuestSeeker will list it in the app, but personal outreach makes a big
        difference in boosting participation:
        <ul className="list-[circle] list-outside pl-5 mt-2 flex flex-col gap-1">
          <li>
            For a charity or community event: spread the word via email
            newsletters, your organization’s social media, community bulletin
            boards, local press, and partner organizations. Emphasize the fun
            <strong>and</strong> the cause (e.g. “Join our scavenger hunt to
            support the animal shelter – win prizes while helping puppies!”).
            Encourage supporters to invite their friends and family.
          </li>

          <li>
            For a business promotion: advertise to your customers and audience.
            Use your social media channels, in-store signage, and perhaps local
            influencers or radio to create buzz. You could also cross-promote
            with any sponsors or partner businesses. Make sure to highlight what
            makes the Quest exciting: “Find the golden tickets hidden around
            town and win a free month of our service!” – tie it into your
            brand’s story.
          </li>

          <li>
            If the Quest is public (which most are), you generally want as many
            people as possible to join. If it’s a private or corporate
            team-building Quest, send direct invites to the intended
            participants with the Quest code or link.
          </li>
        </ul>
      </>,
      <>
        As the start date approaches, keep engagement up: remind people to sign
        up before it begins, and maybe drop a teaser or clue on social media to
        spark curiosity. If it’s a longer Quest, you can send periodic updates
        or fun messages through the app to all participants during the event
        (QuestSeeker allows creators to push notifications or messages).
      </>,
      <>
        <strong>Wrap Up and Reward:</strong> When the Quest’s end date arrives,
        the app will automatically stop accepting new submissions and mark the
        Quest as completed. Now it’s your turn to wrap things up:
        <ul className="list-[circle] list-outside pl-5 mt-2 flex flex-col gap-1">
          <li>
            <strong>Review Submissions:</strong> Go through the answers and
            photos submitted by players. QuestSeeker’s dashboard makes this
            easy, showing each task and the entries from those who finished. For
            photo or open-ended tasks, verify that the submissions meet the
            criteria or answer the question. (For example, if a task was to take
            a selfie at a statue, make sure the photo indeed shows the correct
            statue.) This ensures fairness and lets you disqualify any obviously
            invalid entries if needed.
          </li>

          <li>
            <strong>Determine Winners:</strong> If your Quest is competitive,
            use the data to figure out the winners. The dashboard will show the
            list of Seekers who completed all tasks, along with the time they
            finished or points earned. Depending on your criteria, identify the
            top performers (e.g. the first 1st, 2nd, 3rd to finish, or the top
            score, etc.). If you promised a random prize draw among finishers,
            you can use a random picker (QuestSeeker might include a button for
            a random selection) or export the list of finishers to do the draw.
            Once decided, mark the winners in the system (QuestSeeker lets you
            tag the winners on the Quest page).
          </li>

          <li>
            <strong>Notify and Distribute Prizes:</strong> QuestSeeker will
            notify the winners through the app (and you will get an email with
            their contact info as the creator). It’s good to follow up with an
            official congratulatory email or message as well, especially if you
            need to coordinate delivering a physical prize. For digital prizes
            like coupon codes or e-gift cards, you can send those via email.
            Make sure every promised prize is delivered and thank your prize
            sponsors as well.
          </li>

          <li>
            <strong>Thank Participants and Announce Results:</strong> Post an
            update or send a message to all Quest participants thanking them for
            joining the adventure. If it was a fundraiser, let everyone know how
            much was raised in total and how those funds will be used to support
            the cause – tie their fun experience back to the real-world impact
            (“Thanks to you, we raised $5,000 for the shelter – that means 50
            dogs will get vaccinated and microchipped!”). For a business
            campaign, you might share some fun stats (like how many players
            participated) and express appreciation, possibly along with a gentle
            plug to keep them engaged with your brand (such as a discount on
            your product as a token of thanks for playing).
          </li>

          <li>
            <strong>Gather Feedback:</strong> If possible, gather feedback from
            participants. You can send a quick survey link or just ask for
            thoughts via email or social media. Learning what people loved or
            what could be improved will help you make your next Quest even
            better.
          </li>

          <li>
            <strong>After-Event Publicity:</strong> Especially for non-profits,
            consider publicising the event’s success. Share photos of people
            doing the Quest (if you have consent) on social media or local news,
            report the fundraising achievement, and build hype for possibly
            doing it again next time. Consistency can turn your Quest into an
            annual tradition. Many participants will be excited to come back
            again – in fact, a well-run charity Quest often leaves participants
            saying they’d recommend it to friends and looking forward to the
            next one!
          </li>
        </ul>
      </>,
      <>
        By following these steps, Quest Creators can launch successful Quests
        with minimal hassle. The platform handles the technical side (challenge
        delivery, answer collection, participant tracking), so you can focus on
        creativity, engagement, and the cause or goal behind your Quest. As one
        organiser noted, such events can be “both fun and educational,” bringing
        people together in a new way while achieving your fundraising or
        marketing objectives.`,
      </>,
    ],
  },
  {
    title: 'QuestSeeker for Non-Profits: Tips to Maximize Fundraising',
    paragraphs: [
      <>
        QuestSeeker is built with non-profit fundraising in mind. Here are some
        tips to help charities and community organisations get the most out of
        the platform and meet their goals:
        <ul className="list-[circle] list-outside pl-5 mt-2 flex flex-col gap-1">
          <li>
            <strong>Low Upfront Cost, High Return:</strong> For non-profits,
            creating a Quest is very budget-friendly – just a $50 setup fee.
            This low cost means almost all the money raised through participant
            donations goes directly to your cause. By setting a reasonable entry
            fee or minimum donation for players (for example, $10–$20), you can
            quickly recoup the $50 and then multiply your fundraising from
            there. The ‘Quest’ model is similar to a charity fun-run or raffle
            ticket sales: supporters are willing to contribute because they know
            they’re getting a fun experience and helping a cause. Be sure to
            communicate exactly how their entry fee will help the mission (e.g.
            “Your $15 ticket provides clean water for one family for a month”).
            When people see the impact of their contribution, they’re more
            excited to join and give.
          </li>

          <li>
            <strong>Encourage Broader Giving:</strong> Beyond just the entry
            fee, think of ways to boost donations during the Quest. You could
            include an optional donation challenge within the Quest (e.g. one
            task could encourage players to donate a small extra amount at a
            certain point for bonus points, or have a physical donation jar if
            there’s a meetup or finale event). You can also encourage players to
            get sponsors or additional pledges for their participation (similar
            to walkathons). Another idea is to allow team play where each team
            raises funds collectively. While the primary format is the entry
            fee, these extra touches can increase the total funds raised and get
            participants even more involved in the cause.
          </li>

          <li>
            <strong>Leverage the Fun Factor for Awareness:</strong> Remember
            that a Quest isn’t just about raising money – it’s also a great
            opportunity to educate participants about your cause in an enjoyable
            way. Design a few of your Quest tasks to highlight facts or stories
            related to your mission. For example, if your charity supports
            environmental conservation, one task could be “Find something green
            (the color of our cause) and snap a photo,” or a trivia question
            like “What year was our nature park established?” When players have
            fun and learn about your work, they become more likely to continue
            supporting you even after the game is over. The adventure aspect
            keeps people engaged, but the underlying message will stick with
            them. In past events, this blend of fun and education has greatly
            increased participant retention and volunteer sign-ups for
            organisations.
          </li>

          <li>
            <strong>Sponsored Prizes = More Participation:</strong> If your
            non-profit doesn’t have the budget for fancy prizes, partner with
            local businesses or supporters to provide them. Sponsored prizes not
            only save you money, but they can actually draw more players to join
            your Quest. People love the chance to win something while doing
            good. For instance, a local restaurant might donate a free dinner
            for two as a prize, a shop could offer a $50 gift card, or a sponsor
            might put up a grand prize like an electronics item or event
            tickets. In return, you can acknowledge these sponsors in your Quest
            description and materials (giving them positive exposure in the
            community). It’s a win-win-win: players get excited about prizes,
            sponsors get promotion, and your event gets more attendees. One
            organiser observed that partnering with a few small businesses for
            gift cards and goodies really boosted registration numbers because
            the incentives were attractive.
          </li>

          <li>
            <strong>Make it Family-Friendly:</strong> Quests naturally appeal to
            both kids and adults, so design your event to be inclusive for all
            ages. The more inclusive and fun your Quest, the more participants
            you’ll attract, and the more funds you can raise. Encourage people
            to form teams – parents with children, teens with grandparents,
            coworkers, friends, everyone can join the adventure. Emphasise in
            your promotions that anyone can play; you don’t have to be a genius
            or super fit (unlike some competitive events). It’s about
            exploration and teamwork, which is accessible to all. By positioning
            your Quest as a family-friendly outing or a community-building
            activity, you’ll tap into a wider audience. For example, “This Quest
            is a fantastic activity to bring your kids, family, friends, or
            colleagues together for a great cause!” When participants have a
            wholesome good time, they’re likely to invite others and return for
            future events.
          </li>

          <li>
            <strong>Publicise the Impact:</strong> After the Quest, let everyone
            know the difference they made. People love to hear the results of
            their efforts. Announce how much money was raised and what it will
            go toward. For instance, “Thanks to our 150 Quest Seekers, we raised
            $3,000 for the shelter – enough to feed all our rescue cats and dogs
            for the next 3 months!” Share this on social media, in a thank-you
            email to participants, and maybe in a press release to local media.
            Publicising the impact not only makes your current participants feel
            great (they see that “every penny you raise will help make a huge
            difference”), but it also builds credibility and interest for those
            who didn’t participate. They might be inspired to join your next
            Quest or donate to your cause directly. If your Quest was a big hit,
            consider making it an annual (or regular) tradition. Consistency can
            build a loyal following who look forward to the event each year.
            Over time, a signature scavenger hunt event can become a cornerstone
            of your fundraising calendar – and you can easily create repeated
            Quests on the QuestSeeker platform.
          </li>
        </ul>
      </>,
      <>
        By focusing on these strategies, non-profits can maximise both the
        financial outcome and community engagement of their QuestSeeker events.
        The combination of gameful fun and philanthropy tends to create a
        positive feedback loop: participants have such a good time that they
        tell others about it and are eager to come back again. In the end,
        QuestSeeker helps turn fundraising into an adventure – one where
        everyone from the organizers to the Seekers to the sponsors feels like
        they are part of something special, exciting, and impactful for the
        community.`,
      </>,
    ],
  },
]
