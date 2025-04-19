# Semantic Search Google Doc Add-on

## Overview
This add on allows the user to perform Semantic Searching within a document by splitting it into chunks, sending them to AstraDB, which uses an AI model to convert chunks to vectors, and then querying the database through the search text field to find the most similar results.

## Installation Instructions
  * Prerequisites
    * Google Account
    * Google Apps Script environment configured for the Google Document (can be accessed via the Extensions > Apps Script menu in a Google Doc)

  * Step 1: Setup AstraDB
    * Create a AstraDB account by visiting here [AstraDB](https://astra.datastax.com/)
      
  * Step 2: Setup Google Apps Script
    * Create a new Google Doc
    * Go to Extensions > Apps Script to open the script editor
    * Copy the contents of the provided `Code.gs`, `Searchbar.html`, `imageDialog.html`, `connection.html`, and `help.html` into the corresponding files in the Google Apps Script editor
    * Save the Project and Click Run
      
  * Step 3: Connect to AstraDB
    * After Clicking "Run" to run the script, a sidebar will appear in the document with a toolbar in the top
    * Click the `Connect` Button on the Toolbar to open another UI
    * On the new UI, click `How to Connect` in order to know how to create a vector database and generate an endpoint/token
    * Once the Endpoint and token have been generated, go back to the doc and use the endpoint/token to connect.
      
## Running the Script
   Once connected, either click the `Help` message on the document and follow along from step 2, or follow along below.

   * Step 1: Reload (At the Top of the Sidebar UI)
     * After the user connects from by entering the endpoint/token, click reload to split the document into chunks that will be sent to the Database
     * Once reload is clicked, a progress bar will appear showing how many chunks are being sent over
     * The advanced settings for the `Reload` section of the UI include Chunk size and overlap which can be modified if you want smaller or larger pieces being sent to the database.

   * Step 2: Search (In the Middle of the Sidebar UI)
     * After the document is loaded to the Database, type a question or phrase in the `Search` section of the UI
     * The user can adjust how many results they want by moving the slider k
     * Once the query and slider are set, click `Search`.

   * Step 3: Results (At the Bottom of the Sidebar UI)
     * Once the search finishes, the results will appear in the bottom seaction of the UI
     * Click any result box to jump to the passage/paragraph in the doc.
     * Additionally, once clicked, it will highlight the passage either green or red depending on the similarity report of the result.
     * Red highlight means a bad similarity match; Green highlight means a good similarity match

## UI Elements
   * `Reload` Section:
     * Chunk Size - Set how large each chunk of text should be when splitting the document (Typically should be left at 500 for best results unless the user knows what they are doing)
     * Overlap - Set how much overlap should be between adjacent chunks (Typically should be left at 50 for best results unless the user knows what they are doing)
     * Status Line - Shows how many chunks were indexed as well as a shortened collection ID

   * `Search` Section:
     * Slider K - Lets the user control how many results they want returned and plotted
## Tips
   * If user changes the documents text or options, reload the document again to reindex
   * The astra collection is temporary so reloading creates a new one each time
   * If Astra limits are hit, delete old colletions from the Astra dashboard
## Screenshots/Example outputs
   * How to Connect

     * Below highlighted in purple is the button to connect to AstraDB.
    ![ConnectButton](https://github.com/emiliano2004tamu/CSCE331-ImagesProject3/blob/main/ConnectButtonLocation.png)

     * After clicking `Connect` the Connect UI will pop up.
     * The button highlighted in purple, `How to connect`, will show steps on how to connect and generate a endpoint/token from AstraDB
     * The text fields highlighted in yellow show where to enter endpoint/token after generating them.
     * Once all fields are entered, click  `Submit` to connect to AstraDB
     ![HowToConnectButton](https://github.com/emiliano2004tamu/CSCE331-ImagesProject3/blob/main/ConnectUI.png)

     * Below is the UI of the "How to Connect" button previosuly mentioned
     ![HowToConnectUI](https://github.com/emiliano2004tamu/CSCE331-ImagesProject3/blob/main/HowToConnectUI.png)

  * Help Section
    * Below is the UI of the Help Button, which directs the user on how to use the Semantic Search UI
     ![HelpButton](https://github.com/emiliano2004tamu/CSCE331-ImagesProject3/blob/main/HelpButton.png)

  * Reload Section
    * Below shows the Reload Section of the UI. The red drawings below depicts what happens when the user clicks reload
     ![HelpButton](https://github.com/emiliano2004tamu/CSCE331-ImagesProject3/blob/main/ReloadSection.png)

  * Search Section
    * Below shows the Search Section of the UI.
    * The user types a query(ex: "What is war?"), clicks search, and then waits until the results populate in the results section
     ![HelpButton](https://github.com/emiliano2004tamu/CSCE331-ImagesProject3/blob/main/SearchSection.png)


  * Results Section
    * Below shows the Results Section of the UI.
    * Once the results has been populated, the user can then click on a result box
    * When a result box gets clicked, it will take the user to the chunk in the document highlighted in green or red based on the similarity result
     ![HelpButton](https://github.com/emiliano2004tamu/CSCE331-ImagesProject3/blob/main/ResultsSection.png)


    * Below is another output of the Results section with a different similarity result.
     ![HelpButton](https://github.com/emiliano2004tamu/CSCE331-ImagesProject3/blob/main/ResultsSection2.png)
