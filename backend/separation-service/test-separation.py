import demucs.api
import torch
import os

# print whether cuda is available
available = torch.cuda.is_available()
print(f'Cuda available: {available}' )

# print the number of GPUs available
gpu_count = torch.cuda.device_count()
print(f'Number of GPUs available: {gpu_count}' )

# htdemucs works, htdemucs_ft doesn't, pretrained checkpoints seem to have wrong shape
separator = demucs.api.Separator(device='cuda')
origin, separated = separator.separate_audio_file('andb.wav')

# Number of separated sources
print(f'Number of separated sources: {len(separated)}')

# create stems folder if not exists
if not os.path.exists('stems'):
    os.makedirs('stems')

# Iterate over the dictionary items
for stem, source in separated.items():
    print(f'Saving {stem}')
    demucs.api.save_audio(source, f"stems/{stem}.wav", samplerate=separator.samplerate)