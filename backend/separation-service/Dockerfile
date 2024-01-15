FROM pytorch/pytorch:2.1.2-cuda12.1-cudnn8-runtime

WORKDIR /code 

COPY requirements.txt /code/requirements.txt

RUN python3 -m pip install -r /code/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

COPY ./app /code/app

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]