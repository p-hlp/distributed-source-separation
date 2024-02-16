# API Gateway

The API Gateway acts as a gateway to all other services and simultaniously offers a REST API for operations like uploading files, initializing SSE streams for clients and downloading files.

# Using docker

tbd

# Running locally

## Dependencies

One of the dependencies is [audiowaveform](https://github.com/bbc/audiowaveform), which handles calculating a downsampled representation of an uploaded audio file. For installation refer to their [installation guide](https://github.com/bbc/audiowaveform?tab=readme-ov-file#installation) or if using ubuntu do:

```bash
sudo add-apt-repository ppa:chris-needham/ppa
sudo apt-get update
sudo apt-get install audiowaveform
```

## First start

1. `yarn install`
2. add `.env` file and copy over the template from `.env.template`
3. `npx prisma db push` to create the `audio_db` table from current prisma schema
4. `npx prisma generate` to generate the prisma client
5. `yarn dev`

Generally its good practise to use `npx prisma db pull` and `npx prisma generate` when you suspect the schema of the db has changed in a previous commit.
