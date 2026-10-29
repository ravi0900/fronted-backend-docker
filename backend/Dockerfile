FROM python:alpine3.24

WORKDIR /

COPY . .

RUN pip install --no-cache-dir -r requirements.txt

ENTRYPOINT ["python3"]

CMD ["app.py"]