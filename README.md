# Tournament Bot

A Discord bot for managing gaming tournaments with comprehensive admin and user commands.

## Features

### Admin Commands
- Cancel Tournament
- Create Bracket
- Create Tournament
- End Tournament
- Start Tournament

### User Commands
- Join Tournament
- Leave Tournament
- List Tournaments
- View Personal Info (Me)
- View Tournament Participants
- Check Tournament Status

## Structure

```
commands/
├── admin/
│   ├── CancelTournament.ts
│   ├── CreateBracket.ts
│   ├── CreateTournament.ts
│   ├── EndTournament.ts
│   └── StartTournament.ts
└── user/
    ├── JoinTournament.ts
    ├── LeaveTournament.ts
    ├── ListTournaments.ts
    ├── Me.ts
    ├── TournamentParticipants.ts
    └── TournamentStatus.ts

guards/
├── AdminOnly.ts
└── ChannelOnly.ts

lib/
types/
main.ts
.env
.gitignore
docker-compose.yml
Dockerfile
package.json
```

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up your `.env` file with necessary Discord bot token and other configurations
4. Run the bot: `npm start`

## Usage

### Admin Commands
- `/cancel-tournament`: Cancels an ongoing tournament
- `/create-bracket`: Generates a bracket for a tournament
- `/create-tournament`: Initiates a new tournament
- `/end-tournament`: Concludes an active tournament
- `/start-tournament`: Begins a scheduled tournament

### User Commands
- `/join-tournament`: Allows a user to enter a tournament
- `/leave-tournament`: Removes a user from a tournament
- `/list-tournaments`: Displays all available tournaments
- `/me`: Shows the user's personal tournament-related information
- `/tournament-participants`: Lists all participants in a tournament
- `/tournament-status`: Provides the current status of a tournament

## Guards
- `AdminOnly`: Ensures certain commands are only accessible to admins
- `ChannelOnly`: Restricts commands to specific channels

## Docker Support
The project includes a Dockerfile and docker-compose.yml for easy containerization and deployment.

## Contributing
Contributions are welcome. Please fork the repository and submit a pull request with your changes.

## License
[Specify your license here]
