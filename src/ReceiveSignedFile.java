// _ICD_COMP_START

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.util.GregorianCalendar;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;

/**
 *
 * @author Giuseppe De Marco (gdm)
 */
public class ReceiveSignedFile extends HttpServlet {

    /** 
     * Processes requests for both HTTP <code>GET</code> and <code>POST</code> methods.
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    protected void processRequest(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    File recivedFile = null;

        try {
            String receiveFilesDirParam = getServletContext().getInitParameter("receiveSignedFilesDir");
            File receiveFilesDir = new File(getServletContext().getRealPath("") + "/" + receiveFilesDirParam);
            //receiveFilesDir = "C:/Documents and Settings/Administrator/Documenti/ProgettiJava/proctonwebutils/build/web/temp";
            if (!receiveFilesDir.exists())
                receiveFilesDir.mkdir();
            
            if (ServletFileUpload.isMultipartContent(request)) {

                ServletFileUpload sfu = new ServletFileUpload(new DiskFileItemFactory(1024 * 1024, receiveFilesDir));
                List fileItems = sfu.parseRequest(request);
                for (int elementIndex = 0; elementIndex<fileItems.size(); elementIndex++) {

                    FileItem item = (FileItem)fileItems.get(elementIndex);
                    if (item.isFormField()) {
                        System.out.println(item.getString());
                        // vedere
                    }

                    else if (!item.isFormField()) { // Il file ricevuto. Lo salvo su disco

                        System.out.println("Ricevo il file " + item.getName() + "...");
                        InputStream fis = null;
                        FileOutputStream fos = null;

                            GregorianCalendar calendar = new GregorianCalendar();
                            int day = calendar.get(GregorianCalendar.DAY_OF_MONTH);
                            int month = calendar.get(GregorianCalendar.MONTH) + 1;
                            int year = calendar.get(GregorianCalendar.YEAR);
                            int hour = calendar.get(GregorianCalendar.HOUR_OF_DAY);
                            int minutes = calendar.get(GregorianCalendar.MINUTE);
                            int seconds = calendar.get(GregorianCalendar.SECOND);
                            String prefixSeparator = "_";

                            // il nome del file sarà: giorno_mese_anno_ore_minuti_secondi_nomedelfilericevuto
                            String prefixString =   day + prefixSeparator +
                                                    month + prefixSeparator +
                                                    year + prefixSeparator +
                                                    hour + prefixSeparator +
                                                    minutes + prefixSeparator +
                                                    seconds + prefixSeparator + 
                                                    request.getSession().getId() + prefixSeparator;

                            String receivedFilePathAndName = receiveFilesDir.getAbsolutePath() + "/" + prefixString + item.getName();
                            // rimunovo eventuali caratteri "?" che mi possono generare errori nella creazione del file
                            receivedFilePathAndName = receivedFilePathAndName.replace("?", "");
                            recivedFile = new File(receivedFilePathAndName);
                       try {   
                            fos = new FileOutputStream(recivedFile);
                            fis = item.getInputStream();
                            byte[] readData = new byte[1024];
                            int i = fis.read(readData);
                            while (i != -1) {
                                fos.write(readData, 0, i);
                                i = fis.read(readData);
                            }
                            fis.close();
                            fos.close();
                        }
                        finally {
                            if (fis != null)
                                fis.close();
                            if (fos != null)
                                fos.close();
                        }
                    }
                    item.delete(); // elimino l'eventuale file temporaneao creato nel parsing della request (N.B. non elimino il file appena creato)
                }
            }
            
            // risponde al client inviando l'url dove il file è stato memorizzato
            PrintWriter respOutWriter = null;
            respOutWriter = response.getWriter();
            //String baseUrl = request.getRequestURL().toString().replace(request.getServletPath(), "/");
            //String fileUrl = baseUrl + receiveFilesDir.getName() + "/" + recivedFile.getName();
            String relativeRecivedFilePath = receiveFilesDirParam + "/" + recivedFile.getName();
            respOutWriter.print(relativeRecivedFilePath);
        
        }
        catch (Exception ex) {
            ex.printStackTrace(System.out);
            if (recivedFile != null)
                recivedFile.delete();
            throw new ServletException(ex);
        }
//        catch (FileUploadException fuex) {
//            fuex.printStackTrace(System.out);
//            if (recivedFile != null)
//                recivedFile.delete();
//            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
//            return;
//        }
//        catch (IOException ex) {
//            ex.printStackTrace(System.out);
//            if (recivedFile != null)
//                recivedFile.delete();
//
//            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
//            return;
//        }
    }

    // <editor-fold defaultstate="collapsed" desc="HttpServlet methods. Click on the + sign on the left to edit the code.">
    /** 
     * Handles the HTTP <code>GET</code> method.
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    /** 
     * Handles the HTTP <code>POST</code> method.
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    /** 
     * Returns a short description of the servlet.
     * @return a String containing servlet description
     */
    @Override
    public String getServletInfo() {
        return "Short description";
    }// </editor-fold>
}
