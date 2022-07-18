#!/bin/sh

# Using a 'cat' here document, create a file for jekyll
# website containing what's required for tag pages.

# Pass in tag name(s)
#   ./createtag linux bsd

CMDLINEPARAM=1     #  Takes at least one param.
POSTDIR="_posts/"
date=$(date '+%Y-%m-%d-')
TAGDATA="_data/tags.yml"

if [ $# -ge $CMDLINEPARAM ]
then
  titles=$@
else
  echo "Atleast ${CMDLINEPARAM} title name is required."
  exit 1
fi

if [ -d "${POSTDIR}" ]; then

  echo "Creating post(s) for ${titles}"

  for title in ${titles}; do
    echo "Tag for $title:"
    read tag
  # Cannot indent here string.
cat <<EOF >"${POSTDIR}/${date}${title}.md"
---
title: "${title}"
tagName: ${tag}
search: exclude
permalink: ${title}.html
sidebar: mydoc_sidebar
---
EOF

echo -e "\n  - ${tag}" >> "${TAGDATA}"
  done
  sed -i '/^[[:blank:]]*$/ d' "${TAGDATA}"
  git add .
else
  echo "Directory ${POSTDIR} doesn't exist or you are not in the top-level directory."
  echo "Please run again from the root directory of your project."
  exit 1
fi
exit
