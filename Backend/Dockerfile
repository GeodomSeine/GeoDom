FROM python:3.10-slim

RUN addgroup nonroot \
    && adduser --system --ingroup nonroot nonroot

WORKDIR /code

COPY requirements.txt /code/requirements.txt

RUN pip install -r /code/requirements.txt

COPY *.py /code/

EXPOSE 2020
USER nonroot

CMD ["fastapi", "run", "main.py", "--host", "0.0.0.0", "--port", "2020"]