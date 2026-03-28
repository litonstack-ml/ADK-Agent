# Official image of Python
FROM python:3.10-slim

# Work place
WORKDIR /app

# Copying file
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all the code
COPY . .

# For cloud run
EXPOSE 8080

# Command to run the agent
CMD ["python", "main.py"]
