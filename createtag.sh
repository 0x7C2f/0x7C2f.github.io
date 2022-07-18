#!/bin/sh

CMDLINEPARAM=1
TAGDIR="pages/tags"
TAGDATA="_data/tags.yml"

if [ $# -ge $CMDLINEPARAM ]
then
  tags=$@
else
  echo "Atleast ${CMDLINEPARAM} tag name is required."
  exit 1
fi

if [ -d "${TAGDIR}" ]; then

  echo "Creating tag(s) for ${tags}"

  for tag in ${tags}; do
    echo "Title for $tag:"
    read title
  # Cannot indent here string.
cat <<EOF >"${TAGDIR}/tag_${tag}.md"
---
title: "${title}"
tagName: ${tag}
search: exclude
permalink: tag_${tag}.html
sidebar: mydoc_sidebar
hide_sidebar: true
folder: tags
---

{% include taglogic.html %}

{% include links.html %}
EOF

echo "  - ${tag}" >> "${TAGDATA}"

  done
  sed -i '/^[[:blank:]]*$/ d' "${TAGDATA}"
  git add .
else
  echo "Directory ${TAGDIR} doesn't exist or you are not in the top-level directory."
  echo "Please run again from the root directory of your project."
  exit 1
fi
exit
