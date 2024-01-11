FROM debian:bullseye

ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /mnt/data

RUN mkdir -p /mnt/data
ENV HOME=/mnt/data

# Install base packages
RUN \
  apt-get update -y && \
  apt-get upgrade -y && \
  apt-get install -y \
  build-essential \
  cmake \
  curl \
  nano \
  ca-certificates \
  openssh-server \
  wget \
  ffmpeg \
  libsm6 \
  libxext6 \
  google-perftools \
  git-lfs \
  git \
  unzip

# Install additional packages
RUN \
  apt-get update -y && \
  apt-get upgrade -y && \
  apt-get install -y \
  texlive-fonts-recommended \
  texlive-fonts-extra

RUN apt-get remove -y python2.7 python2.7-minimal --purge

# https://docs.anaconda.com/free/anaconda/install/linux/
RUN apt-get install libgl1-mesa-glx libegl1-mesa libxrandr2 libxrandr2 libxss1 libxcursor1 libxcomposite1 libasound2 libxi6 libxtst6 -y

RUN git lfs install

# Chromium base packages
RUN apt-get install -y xvfb x11-apps x11-xkb-utils libx11-6 libx11-xcb1
# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chromium that Puppeteer
RUN apt-get update -y \
  && apt-get install -y gnupg \
  && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
  && apt-get update \
  && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

# Install ChromeDriver
RUN CHROME_DRIVER_VERSION=`curl -sS chromedriver.storage.googleapis.com/LATEST_RELEASE` && \
  wget -N https://chromedriver.storage.googleapis.com/$CHROME_DRIVER_VERSION/chromedriver_linux64.zip -P ~/ && \
  unzip ~/chromedriver_linux64.zip -d ~/ && \
  rm ~/chromedriver_linux64.zip && \
  mv -f ~/chromedriver /usr/local/bin/chromedriver && \
  chown root:root /usr/local/bin/chromedriver && \
  chmod 0755 /usr/local/bin/chromedriver

# Install geckodriver and firefox
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
  ca-certificates curl firefox-esr           \
  && rm -fr /var/lib/apt/lists/*                \
  && curl -L https://github.com/mozilla/geckodriver/releases/download/v0.32.2/geckodriver-v0.32.2-linux64.tar.gz | tar xz -C /usr/local/bin

# Install OpenJDK
RUN apt-get update && apt install -y wget apt-transport-https
RUN mkdir -p /etc/apt/keyrings
RUN wget -O - https://packages.adoptium.net/artifactory/api/gpg/key/public | tee /etc/apt/keyrings/adoptium.asc
RUN echo "deb [signed-by=/etc/apt/keyrings/adoptium.asc] https://packages.adoptium.net/artifactory/deb $(awk -F= '/^VERSION_CODENAME/{print$2}' /etc/os-release) main" | tee /etc/apt/sources.list.d/adoptium.list
RUN apt update -y && apt install -y temurin-17-jdk

# # Setup Display for Chromium
# RUN Xvfb -ac :99 -screen 0 1920x1080x16 & export DISPLAY=:99
# ENV DISPLAY=:99

# Install Python3
ENV PIP_BREAK_SYSTEM_PACKAGES 1
RUN apt-cache policy python3.10
RUN apt-get update -y && apt-get upgrade -y && apt-get install -y python3-pip
RUN pip3 install --upgrade pip setuptools
RUN pip3 install selenium undetected-chromedriver selenium-stealth beautifulsoup4 requests numpy pandas matplotlib scipy scikit-learn markdown pandas pdfkit youtube-dl seaborn
RUN ln -s /usr/bin/python3 /usr/bin/python

# Install Node.js 18
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
  && apt-get install -y nodejs

RUN npm install --global yarn ts-node nodemon pm2 kill-port wait-port typescript

RUN \
  apt-get update -y && \
  apt-get upgrade -y && \
  apt-get install -y \
  pandoc \
  html2text \
  unrar-free \
  lynx \
  elinks \
  texlive-latex-base \
  wikipedia2text \
  texlive-latex-extra \
  texlive-extra-utils \
  texlive-xetex \
  wkhtmltopdf \
  w3m \
  enscript \
  ghostscript \
  tree \
  jq \
  gnuplot \
  sshpass \
  imagemagick \
  poppler-utils \
  libreoffice \
  dbus \
  socat \
  bc

# RUN service dbus start

# Run OpenSSH server
RUN echo "root:root" | chpasswd
RUN sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config
RUN sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config

EXPOSE 22 9222

RUN ["service", "ssh", "start"]
CMD ["/usr/sbin/sshd", "-D"]
