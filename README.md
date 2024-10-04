# Tournament Bot

Tournament Bot is a Discord bot designed to streamline the organization and management of gaming tournaments. With features like bracket generation, match scheduling, and result tracking, it's the perfect tool for gaming communities looking to run smooth, efficient tournaments.

## Features

- **Bracket Generation**: Automatically create tournament brackets based on participant count and format.
- **Match Scheduling**: Easily schedule matches and notify participants.
- **Result Tracking**: Keep track of match results and update brackets automatically.
- **Player Management**: Register players, manage teams, and handle seeding.
- **Discord Integration**: Seamlessly interact with the bot through Discord commands.

## Getting Started

### Prerequisites

- Node.js (version 14.0.0 or higher)
- A Discord account and a registered Discord application/bot

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/Bit-Barron/tournament-bot.git
   ```

2. Navigate to the project directory:
   ```
   cd tournament-bot
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Create a `.env` file in the root directory and add your Discord bot token:
   ```
   TOKEN=your_discord_bot_token_here
   ```

5. Start the bot:
   ```
   npm start
   ```

## Usage

Once the bot is running and added to your Discord server, you can use the following commands:

- `/create-tournament`: Start a new tournament
- `/register`: Register for an ongoing tournament
- `/bracket`: View the current tournament bracket
- `/report-result`: Report the result of a match

For a full list of commands, use `/help` in your Discord server.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to the Discord.js team for their excellent library
- Inspired by the need for better tournament management in gaming communities
