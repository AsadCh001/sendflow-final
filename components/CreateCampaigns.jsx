"use client"
import React, { useState } from 'react';
import HandlingData from 'components/email-component/HandlingData';
import ExcelImport from 'components/email-component/ExcelImport';
import Schedule from 'components/email-component/Schedule'
import SuccessModal from "components/email-component/SuccessModal";
import FailedModal from "components/email-component/FailedModal";
import SelectedAccount from 'components/email-component/SelectedAccount';
import axios from "axios";
import Analytics from 'components/email-component/Analytics';
import { useSession } from 'next-auth/react';
import './createcampaign.css'

function CreateCampaign({
  email,
  MultiEmail,
  setEmail,
  appPassword,
   MultiAppPassword,
  setAppPassword,
  subject,
  setSubject,
  body,
  setBody,
  tableData,
  setTableData,
  dateInfo,
  setdateInfo,
  file,
  setfile,
  setSchedule,
  schedule,
  id,
  setid,
})
   {
    const { data:user } = useSession();
    const mail = user.user.email;

  const [cid,setcid] = useState("");
 const [activeTab, setActiveTab] = useState(null);
 const [additionalAccounts, setAdditionalAccounts] = useState([]);
 const [filename, setfilename] = useState("");

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [FailedMessage, setFailedMessage] = useState("");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isFailedModalOpen, setIsFailedModalOpen] = useState(false);
  
  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };
  const handleCloseSuccessModal = () => {
    setIsSuccessModalOpen(false); // Close the modal
  };

  const handleCloseFailedModal = () => {
    setIsFailedModalOpen(false); // Close the modal
  };

  const handleSelectedAccounts = (selectedAccounts) => {
    console.log("selected accounts:",selectedAccounts)
    // You can now combine the accounts with the existing email and password
    const combinedAccounts = [
      // If there's already an email and password, include them as the first account
      ...(MultiEmail && MultiAppPassword ? [{ MultiEmail, MultiAppPassword }] : []),
      // Add the selected accounts
      ...selectedAccounts,
    ];

    setAdditionalAccounts(combinedAccounts);
    console.log('Updated list of accounts:', combinedAccounts);
  };
  
  const sendEmailDataToApi = async (e) => {
    e.preventDefault();
  
  
    // Check for missing or empty fields
    if (!email || !appPassword || !subject || !body || !dateInfo || tableData.length === 0) {
      setError('Please fill in all required fields.');
      setTimeout(() => {
        setError('');
      }, 2000);
      return;
    }

    const scheduled = dateInfo;

    try {
      
      const authResponse = await axios.post('/api/auth', {
        email,
        appPassword,
      });

      if (authResponse.status === 200) {
        setError('');
        setSuccessMessage('Authentication Approved.');
        setIsSuccessModalOpen(true);
      } else {
        setFailedMessage("Email Not Sent. Authenticate Yourself Again")
        setIsFailedModalOpen(true);
        return;
      }
      if (additionalAccounts.length > 0) {
        console.log("Additional accounts are:", additionalAccounts)
        // Authenticate the additional accounts
        const additionalAuthResults = await Promise.all(
          additionalAccounts.map(account => 
            axios.post('/api/auth', {
              email: account.email,
              appPassword: account.appPassword,
            })
            .then(response => ({ ...account, authResult: response.data }))
            .catch(error => ({ ...account, error }))
          )
        );
      
        // Check if all additional accounts were authenticated successfully
        const allAuthSuccess = additionalAuthResults.every(account => account.authResult);
      
        if (allAuthSuccess) {
          setError('');
          setSuccessMessage('Authentication Approved for Additional Accounts');
          setIsSuccessModalOpen(true);
        } else {
          const failedAccounts = additionalAuthResults.filter(account => !account.authResult);
          // Handle failed authentications, possibly listing the accounts that failed
          setFailedMessage(`Authentication failed for some accounts: ${failedAccounts.map(acc => acc.email).join(', ')}`);
          setIsFailedModalOpen(true);
          return; // Stop the process if any authentication fails
        }
      } else {
        // If there are no additional accounts, you can skip this step or handle accordingly
        console.log('No additional accounts to authenticate');
      }

       console.log("filename",filename);
      const res = await axios.post('/api/campaign', {
        subject,
        body,
        email,
        appPassword,
        excelFile: filename,
        schedulingData: scheduled,
        mail
      })
  
      if (res.status === 200) {
        id = await res.data.campaign._id;
        setError('');
        setSuccessMessage('Campaign Stored successfully.');
        setIsSuccessModalOpen(true);
        console.log("successfull", id)
        setcid(id)
      } else {
        console.error('Campaign failed.');
      }

      
      // Send data to the first API endpoint
      const response1 = await axios.post('/api/api_four', {
        subject,
        body,
        email,
        additionalAccounts,
        appPassword,
        data: tableData,
        dateInfo,
        id,
        mail
      });
  
      if (response1.status === 200) {
        setError('');
        setSuccessMessage('Campaign Sent successfully.');
        setIsSuccessModalOpen(true);
      } else {
        console.error('Error:', response1.data);
        setError('An error occurred while sending data.');
        setTimeout(() => {
          setError('');
        }, 2000);
      }


  

     } catch (error) {
      console.error('Error:', error);
      setFailedMessage("Email Not Sent. Authenticate Yourself Again")
      setIsFailedModalOpen(true);
    
    }
  };
  

    const dateInfofun = (date) =>{
      
      if (!date) {
        setError("Please Give Date & Time");
        return;
      }
      
      setdateInfo(date)
      
      console.log('Date & time received in CreateCampaign:', date);
    }

    const handleSendEmail = (emailData) => {
      const { email, appPassword, subject, body } = emailData;
      if (!email || !appPassword || !subject || !body) {
        setError("Please fill in all required fields.");
        return;
      }
      setEmail(email);
      setAppPassword(appPassword);
      setBody(body);
      setSubject(subject);
    };
  

    const handleTableDataChange = (tableData, uploadedFilename) => {
      if (tableData.length === 0) {
        setError("Please Upload File");
        return;
      }
      console.log(uploadedFilename);
      // Implement your logic here to handle the table data
      setTableData(tableData);
      setfilename(uploadedFilename);
      console.log('Table data received in CreateCampaign:', tableData);
      console.log('Uploaded filename:', uploadedFilename);
    
      // Now you can use the uploadedFilename in your logic as needed
    };

    const renderCreateButton = () => {
      if (activeTab === 'Email') {
        return (
          <button
          style={{
            borderRadius: '0.5rem', // equivalent to rounded-lg
            backgroundColor: 'black', // equivalent to bg-black
            color: 'white', // equivalent to text-white
            padding: '12px 80px',
            cursor:"pointer" ,
            // py-3 px-20, assuming Tailwind's default spacing scale
          }}
            onClick={sendEmailDataToApi}
          >
            Send
          </button>
        );
      } else {
        return null; // Hide the button for other tabs
      }
    };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Analytics':
        return <Analytics id={id} cid={cid}/>;
      case 'Email':
        return <HandlingData onSendEmail={handleSendEmail}
         email={email} // Pass email as prop
        appPassword={appPassword} // Pass appPassword as prop
        subject={subject} // Pass subject as prop
        body={body} />;

      case 'Leads':
        return <div ><ExcelImport onTableDataChange={(tableData,filenameFromResponse) => handleTableDataChange(tableData, filenameFromResponse)} tableData={tableData} file={file}/> </div>;
      case 'Schedule':
        return <Schedule takedateInfo={dateInfofun}  dateInfo={dateInfo} schedule={schedule}/>;
      case 'Others':
        return <div><SelectedAccount onAccountSelected={handleSelectedAccounts}  /></div>;
      default:
        return null;
    }
  };


  return (
  
    <div className="create-campaign-container">
<div className="tab-buttons-container">
  <button
    onClick={() => handleTabClick('Analytics')}
    className={`tab-button ${activeTab === 'Analytics' ? 'tab-button-active' : 'tab-button-inactive'}`}
  >
    Analytics
  </button>
  <button
    onClick={() => handleTabClick('Email')}
    className={`tab-button ${activeTab === 'Email' ? 'tab-button-active' : 'tab-button-inactive'}`}
  >
    Email
  </button>
  <button
    onClick={() => handleTabClick('Leads')}
    className={`tab-button ${activeTab === 'Leads' ? 'tab-button-active' : 'tab-button-inactive'}`}
  >
    Leads
  </button>
  <button
    onClick={() => handleTabClick('Schedule')}
    className={`tab-button ${activeTab === 'Schedule' ? 'tab-button-active' : 'tab-button-inactive'}`}
  >
    Schedule
  </button>
  <button
    onClick={() => handleTabClick('Others')}
    className={`tab-button ${activeTab === 'Others' ? 'tab-button-active' : 'tab-button-inactive'}`}
  >
    Others
  </button>
</div>

        
        <div className="tab-content">
        {renderTabContent()} <br />
        
        
        </div>
        <div className="send-button-container">{renderCreateButton()}</div><br />
        {error && <p className="error-message">{error}</p>} 
        
        
        {isSuccessModalOpen && (
              <SuccessModal
                SuccessMessage={successMessage}
                onClose={handleCloseSuccessModal}
              />
            )}

        { isFailedModalOpen && (
              <FailedModal
                FailedMessage={FailedMessage}
                onClose={handleCloseFailedModal}
              />
            )}
      </div>
   
  );
}

export default CreateCampaign;
