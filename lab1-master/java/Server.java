//Server template is from lab1 instructions
//Server methods is taken from lecture 2

import java.io.*;
import java.net.*;
import java.util.HashMap;
import java.util.Random;

public class Server {

    private final int port = 8989;

    public static void main(String[] args) {
        new Server();
    }

    public Server() {
        try (ServerSocket serverSocket = new ServerSocket(this.port)) {
            System.out.println("Listening on port: " + this.port);
            HashMap<String, User> cookieMap=new HashMap<>();


            while (true) {
                try (Socket socket = serverSocket.accept();
                     BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
                     BufferedWriter out = new BufferedWriter(new OutputStreamWriter(socket.getOutputStream()))
                ) {
                    String line = null;
                    String headers="";

                    while ((line = in.readLine()) != null) { // read
                        // Taget från Vahids Form-kod
                        while (!line.equals("")){
                            System.out.println(" <<< " + line); // log
                            headers += line+"\n";
                            line=in.readLine();
                        }
                        if (headers.indexOf("GET")==0) {
                            // process the GET request
                            // Cookie-läsning taget från Vahids Form-kod
                            String cookie =  headers.substring(headers.indexOf("Cookie: ")+"Cookie: ".length());
                            cookie=cookie.substring(0,cookie.indexOf("\n")).strip();

                            if (!cookieMap.containsKey(cookie)) {
                                //If the cookie does not have a user (1st time) create a new user.
                                Random rand = new Random();
                                int randNum=rand.nextInt(1000);
                                while (cookieMap.containsKey(String.valueOf(randNum))){
                                    randNum=rand.nextInt(1000);
                                }
                                String newCookie= ""+randNum;
                                cookieMap.put(newCookie, new User(socket.getInetAddress())); //Connect an IP to the user.
                                cookie = newCookie;
                                System.out.println(newCookie + " cookie");
                                System.out.println(socket.getInetAddress());
                            }

                            String payload= readFile("guess.html");
                            User user = cookieMap.get(cookie);
                            if (! socket.getInetAddress().equals(user.IP)){
                                in.close();
                                break;
                            }

                            if (user.guess_count > 0){
                                if (user.last_guess == user.correct_guess){
                                    payload = payload.replace("#Infotext",
                                            "Well done!");
                                    payload = payload.replace("<form name=\"guessform\" method=\"POST\"><input type=\"text\" name=gissadeTalet autofocus><input type=\"submit\"  value=\"Guess\"></form>",
                                            "<br><a href=\"/\">new game</a>");
                                    cookieMap.remove(cookie);

                                    String response= "HTTP/1.1 200 OK\nSet-Cookie: "
                                            +cookie+"; Expires=Wed, 21 Oct 2015 07:28:00 GMT"+"\nContent-Length: "+payload.length()
                                            +"\nConnection: close\nContent-Type: text/html\n\n";
                                    response +=payload;
                                    out.write(response);
                                    out.close();
                                }
                                else if (!(user.last_guess==-1)){
                                    payload = payload.replace("#Infotext",
                                            "Nope, guess a number between " + user.min_guess + " and " + user.max_guess + ".<br>You have made "+user.guess_count +" guess(es);");
                                    String response= "HTTP/1.1 200 OK\nSet-Cookie: "
                                            +cookie+""+"\nContent-Length: "+payload.length()
                                            +"\nConnection: close\nContent-Type: text/html\n\n";
                                    response +=payload;
                                    out.write(response);
                                    out.close();}
                                else{
                                    user.guess_count--;
                                    payload = payload.replace("#Infotext",
                                            "Only numbers between " + user.min_guess + " and " + user.max_guess + ", try again!");
                                    String response= "HTTP/1.1 200 OK\nSet-Cookie: "
                                            +cookie+""+"\nContent-Length: "+payload.length()
                                            +"\nConnection: close\nContent-Type: text/html\n\n";
                                    response +=payload;
                                    out.write(response);
                                    out.close();
                                }

                            }
                            else if(user.guess_count == 0){
                                payload = payload.replace("#Infotext","Welcome to the Number Guess Game. <br>Guess a number between 1 and 100.");
                                String response= "HTTP/1.1 200 OK\nSet-Cookie: "
                                        +cookie+""+"\nContent-Length: "+payload.length()
                                        +"\nContent-Type: text/html\n\n";
                                response +=payload;
                                out.write(response);
                                out.close();
                            }

                        }
                        else if (headers.indexOf("POST")==0) {
                            // process the POST request
                            String response="";
                            System.out.println("Got a POST-request\n"+headers+"<");
                            String request_payload;

                            //parse cookie
                            String cookie = headers.substring(headers.indexOf("Cookie: ")+"Cookie: ".length());
                            cookie=cookie.substring(0,cookie.indexOf("\n"));
                            cookie=cookie.strip();
                            User user=cookieMap.get(cookie);




                            if (!(socket.getInetAddress().equals(user.IP))){
                                in.close();
                                break;
                            }

                            String content_length =  headers.substring(headers.indexOf("Content-Length: ")+"Content-Length: ".length());
                            content_length =  content_length.substring(0,content_length.indexOf("\n"));

                            request_payload = readPayload(in,Integer.parseInt(content_length));
                            String guess_str = request_payload.substring(request_payload.indexOf("gissadeTalet=")+"gissadeTalet=".length());

                            try{
                                int guess = Integer.parseInt(guess_str);
                                if ((guess < user.max_guess) && (guess > user.min_guess)){
                                    user.last_guess=guess;
                                    user.guess_count++;

                                    if (guess < user.correct_guess){
                                        user.min_guess = guess;
                                    }
                                    else if (guess > user.correct_guess){
                                        user.max_guess = guess;
                                    }
                                }
                                else{
                                    user.last_guess=-1;
                                    user.guess_count++;
                                }
                                response= "HTTP/1.1 302 Found\nLocation: http://localhost:8989\n\n";
                                System.out.println(response);
                                out.write(response);
                                out.close();
                            }
                            catch(Exception e){
                                user.last_guess=-1;
                                user.guess_count++;
                                response= "HTTP/1.1 302 Found\nLocation: http://localhost:8989\n\n";
                                System.out.println(response);
                                out.write(response);
                                out.close();
                            }
                        }
                    }
                }
                catch (IOException e) {
                    System.err.println(e.getMessage());
                }
            }
        }
        catch (IOException e) {
            System.err.println(e.getMessage());
            System.err.println("Could not listen on port: " + this.port);
            System.exit(1);
        }
    }
    public String readFile(String filename)throws IOException{
        // Taget från Vahids Form-kod
        BufferedReader file=new BufferedReader(new FileReader(filename));
        String contents ="";
        String line = "";
        while ((line = file.readLine()) != null)
            contents += line;
        return contents;
    }

    public String readPayload(BufferedReader scktIn,int contentLength)throws IOException{
        // Taget från Vahids Form-kod
        char[] cbuf=new char[contentLength];
        scktIn.read(cbuf, 0, contentLength);
        return new String(cbuf);
    }
}

class User{
    private static int num_users = 0;
    private int user_num;

    public int guess_count = 0;
    public int last_guess = -1;
    public final int correct_guess;
    public int min_guess = 1;
    public int max_guess = 100;
    public final InetAddress IP;

    User(InetAddress ip){
        num_users++;
        user_num=num_users;
        Random rand = new Random();
        correct_guess = rand.nextInt(100+1)+1;
        System.out.println(correct_guess);
        System.out.println(ip);
        IP = ip;


    }

}
