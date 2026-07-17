<!doctype html>
<html class="no-js" lang="en">
<head>
  {% include "<%= inSubFolder %>inc/_meta.njk" %}
</head>

<body class="preload {{ body_class }}" lang="en">
  {% include "<%= inSubFolder %>inc/_nav.njk" %}

  <main id="content" class="content" role="main">
    {% block content %}
    {% endblock %}
  </main>

  {% include "<%= inSubFolder %>inc/_footer.njk" %}

  <link rel="stylesheet" href="../css/theme.css">
  <script src="../js/theme.js" defer></script>
</body>
</html>
