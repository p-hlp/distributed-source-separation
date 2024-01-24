import asyncio
from bullmq import Worker, Job
import random


async def process(job: Job, jobToken):
    # Simulate some wating time with random delay of 2-5 seconds
    await asyncio.sleep(2 + random.randint(0, 3))
    print(f"Processing job: {job.id} - {job.name} - {job.data}")
    print(f"Finished Job - process {job.id} returning - 'done'")
    # TODO Add Separation of audio file here, job.data will contain the path to the audio file (in object storage)
    # TODO After separation, store the separated audio files in object storage
    # TODO After storing stems, store the path to the stems in the database under the trackId, set status to 'separated'
    # TODO return trackId and status, so the api-gateway can notify the client
    return "done"


async def main():
    queue_name = "process"
    host = "localhost"
    port = 6379
    opts = {"connection": f"redis://{host}:{port}"}
    worker = Worker(queue_name, process, opts)

    while True:  # Worker runs indefinitely for now
        await asyncio.sleep(1)

    # When no need to process more jobs we should close the worker
    await worker.close()


if __name__ == "__main__":
    asyncio.run(main())
