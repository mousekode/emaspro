<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GoldChain Pro - Premium Asset Registry</title>
    
    <!-- Tailwind CSS via CDN -->
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    
    <!-- Google Fonts -->
    <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Cinzel:wght@600;700&display=swap"
        rel="stylesheet">
    
    <!-- Custom CSS -->
    <link rel="stylesheet" href="src/assets/css/goldchain.css">
</head>
<body class="bg-[#0b0c14] text-slate-200 min-h-screen flex flex-col items-center p-4 md:p-8">
    <!-- Main Content -->
    <?php include $page; ?>

    <!-- Blockchain & Web3 Logic -->
    <script src="src/assets/js/goldchain.js"></script>
</body>
</html>
