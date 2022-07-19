<html>
    <script src='Tasker.js'></script>
    <script lang='JavaScript'>
        // user clicked the button
       function buttonClicked() {

            var ok = performTask('ExactNameOfTask','10','','');     
            var ok = destroyScene('HTML Popup');
            exit();
     }
    </script>
    <body>
    <input id="Button1" title="Click Here" type="button" value="Click Here" onclick=' buttonClicked();'/>
    </body>
</html>