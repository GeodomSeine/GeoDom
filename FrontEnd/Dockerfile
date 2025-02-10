FROM node:lts

WORKDIR /code
COPY package.json /code/
RUN npm install --ignore-scripts
COPY . /code
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]