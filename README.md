# Resident Industry Change Application - Seeding Instructions

This document provides instructions for seeding the database with test data for Residents and Industry Change Applications.

## Setup

1. Make sure MongoDB is running
2. Update the database.config.ts file with your MongoDB URI
3. Install dependencies:
   ```
   npm install
   ```

## Available Seed Commands

### Residents

To seed residents (drops existing data):
```
npm run command create:resident
```

### Industry Change Applications

To seed industry change applications (drops existing data):
```
npm run command create:industry-applications
```

## Seed Data

### Residents

The seed creates the following residents:

1. **John Doe**
   - E-Resident working in physical jurisdiction
   - Health industry under USA regulations

2. **Jane Smith**
   - Physical resident not working in physical jurisdiction

3. **Alice Johnson**
   - Limited E-Resident working in physical jurisdiction
   - Finance and Insurance industry under German regulations

### Industry Change Applications

For each resident, the following applications are created:

1. **IN_REVIEW Application**
   - Status: IN_REVIEW
   - Requesting change to a different industry with physical jurisdiction work

2. **APPROVED Application**
   - Status: APPROVED
   - Requesting change to not work in physical jurisdiction
   - Decision made automatically

3. **REJECTED Application** (only for John Doe)
   - Status: REJECTED
   - Requesting change to Private Security industry
   - Decision made by admin with rejection reason

## Implementation Details

The seed commands are implemented using `nestjs-command`. Each command will:

1. Drop all existing data in its collection
2. Create new seed data from scratch


## Troubleshooting

If you encounter issues:

1. **MongoDB Connection**: Ensure MongoDB is running and accessible
2. **Logs**: Check console output for specific error messages
3. **Database**: Use MongoDB Compass or another tool to verify the data was created correctly

## Source Files

- **Residents Seeder**: `src/seeds/resident.seed.ts`
- **Industry Change Applications Seeder**: `src/seeds/industry-change.seed.ts`
- **Seed Module**: `src/seeds/command.module.ts`
- **CLI Entry Point**: `src/cli.ts`