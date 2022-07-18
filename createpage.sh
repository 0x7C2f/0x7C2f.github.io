#!/bin/sh
CMDLINEPARAM=1     #  Takes at least one param.
PAGEDIR="pages/mydoc"
date=$(date +"%B %d, %Y")
TAGDATA="_data/tags.yml"

if [ $# -ge $CMDLINEPARAM ]
then
  titles=$@
else
  echo "At least ${CMDLINEPARAM} title name is required."
  exit 1
fi

if [ -d "${PAGEDIR}" ]; then

  echo "Creating post(s) for ${titles}"

  for title in ${titles}; do
    echo "Tag for $title:"
    read tag
  # Cannot indent here string.
cat <<EOF >"${PAGEDIR}/${title}.md"
---
title: ${title}
tags: ${tag}
keywords: ${tag}
last_updated: ${date}
sidebar: mydoc_sidebar
permalink: ${title}.html
---
EOF

    echo -e "\n  - ${tag}" >> "${TAGDATA}"
  done
  sed -i '/^[[:blank:]]*$/ d' "${TAGDATA}"
  git add .
else
  echo "Directory ${PAGEDIR} doesn't exist or you are not in the top-level directory."
  echo "Please run again from the root directory of your project."
  exit 1
fi
exit
