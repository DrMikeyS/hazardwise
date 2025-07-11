# HazardWise

*Empowering busy clinicians to complete the DCB0160 process in minutes—create hazard logs, quantify risks, and generate ready-to-share mitigation reports for your team.*

## Features

* Create and edit hazards, causes, mitigations, and impacts
* Risk rating matrix with DCB0160-style scoring and definitions
* Fully client-side – no server or login required

## Demo

[Live Demo](https://drmikeys.github.io/hazardwise)

A ready-to-use template DCB0160 hazard log for a generic AI-scribe tool is included in the repo.  
You can download it and import directly into the app:

[Download the Generic AI Scribe Tool hazard log](https://raw.githubusercontent.com/DrMikeyS/hazardwise/refs/heads/main/test_data/Generic%20AI%20Scribe%20Tool-hazardwise-data.json)


## Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/) (v18 or later recommended)

### Installation

```bash
git clone https://github.com/drmikeys/hazardwise.git
cd hazardwise
npm install
```

### Running the App

```bash
npm run dev
```

Navigate to `http://localhost:5173` in your browser.

### Building for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── lib/           # Reusable components and utilities
├── routes/        # SvelteKit pages
├── stores/        # Svelte writable stores for app data
├── utils/         # Hazard utilities (ID generation, linking, etc.)
└── app.html       # HTML shell (includes favicon, meta, etc.)
```

## Development Notes

* All data is currently stored in-memory via Svelte stores and in cookies
* Risk ratings follow a customisable 5×5 matrix with configurable thresholds

## License

MIT License. 