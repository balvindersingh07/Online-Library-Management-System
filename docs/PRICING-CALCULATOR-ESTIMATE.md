# Azure Pricing Calculator — Monthly Estimate

Project: **Online Library Management System**  
Currency: **USD**  
Region baseline: **Central India**  
Prepared for assignment deliverable: App Service + Azure SQL Database + Blob Storage

## Estimated Monthly Breakdown

| Service | SKU / Configuration | Estimated Monthly Cost (USD) |
|---------|----------------------|-----------------------------:|
| Azure App Service | Linux B1 (1 core, 1.75 GB RAM) | 12.00 |
| Azure SQL Database | Basic (2 GB) | 9.00 |
| Azure Blob Storage | Hot LRS (5 GB + typical transactions) | 1.50 |
| **Total** |  | **22.50** |

## Cost-Saving Notes

- Use **Azure SQL Serverless (auto-pause)** when workload is sporadic.
- Use **LRS** instead of **GRS** for coursework/demo workloads.
- Keep App Service on **B1/F1** during development; scale only for demos/evaluation.
- Remove unused test resources after submission to avoid recurring charges.

## Submission Note

If your evaluator requires an actual portal export screenshot/PDF, open the Azure Pricing Calculator and export with your tenant-specific values, then replace this file with the official export artifact.
