<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
</head>
<style>
    .check,
    .cancel {
        display: none;
        height: 15px;
        width: 15px;
    }
</style>

<body>

    <b>Enter IFSC Code:</b>
    <input type=" text" name='ifsc' id="ifsc" onchange="myFunction(this.value)" pattern="^[A-Z]{4}0[A-Z0-9]{6}$">
    <img src="./assets/check.png" class="check" alt="">
    <img src="./assets//cancel.png" class="cancel" alt="">
    <!-- <button type="button" id="btnWithdrawModal" name="btnWithdrawModal" class="btnWithdrawModal">Withdraw</button> -->


    <?php
    // if (isset($_POST['submit'])) {
    //     $ifsc = $_POST['ifsc'];
    //     $json = @file_get_contents(
    //         "https://ifsc.razorpay.com/" . $ifsc
    //     );
    //     $arr = json_decode($json);

    //     if (isset($arr->BRANCH)) {
    //         echo "Correct IFSC Code";
    //     } else {
    //         echo "Invalid IFSC Code";
    //     }
    // }
    //     
    ?>
    <script>
        // const ifsc = document.getElementById("ifsc")
        // const btnWithdrawModal = document.querySelector('#btnWithdrawModal');

        function myFunction(val) {
            // alert("The input value has changed. The new value is: " + val);
            $.ajax({
                url: 'https://ifsc.razorpay.com/' + val,
                type: 'GET',
                success: function(data) {
                    // console.log(data);
                    if (data.BRANCH) {
                        // alert("Correct IFSC Code");
                        $('.check').css('display', 'block');
                    } else {
                        $('.cancel').css('display', 'block');
                        // alert("Invalid IFSC Code");
                    }
                },
                error: function() {
                    $('.cancel').css('display', 'block');
                    alert('Invalid IFSC Code');
                }
            });
        }
        // btnWithdrawModal.addEventListener('click', function() {

        // });
    </script>
</body>

</html>