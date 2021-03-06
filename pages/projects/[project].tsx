import {
  Grid,
  Container,
  Header,
  Label,
  Button
} from 'semantic-ui-react';
import fs from 'fs';
import path from 'path';
import Page from '../../components/page';
import Meta from '../../components/Meta';
import { Portfolio } from '../../types/portfolio.types';
import { GetStaticProps, GetStaticPaths } from 'next';
import Image from 'next/image';
import { Project } from '../../types/project.types';
import matter from 'gray-matter';
import ReactMarkdown from 'react-markdown';
import EndorsementItem from '../../components/endorsementItem';
import { withHttp } from '../../util/helpers';

export default function MyProject({ portfolio, myProject, mdData, mdContent }: {
  portfolio: Portfolio,
  myProject: Project,
  mdData: any,
  mdContent: any
}) {

  const shareImage = myProject.shareImageUrl ? `${process.env.PUBLIC_URL}${myProject.shareImageUrl}` : '/share.png'

  return (
    <div>
      <Meta
        title={`${myProject.title} | ${portfolio.name}`}
        desc={`${myProject.summary}`}
        canonical={`${process.env.PUBLIC_URL}/projects/${myProject.slug}`}
        image={shareImage} />

      <Page portfolio={portfolio}>
        <Container style={{ width: '100vw', margin: '2.2em 0 5.5em 0' }}>
          <Grid
            style={{ padding: '1.5em 1em 3.5em' }}
            centered
            stackable
            verticalAlign='middle'>
            <Grid.Row style={{ padding: '1em 0.5em 2em' }}>
              <Grid.Column width='9'>
                {myProject.shareImageUrl ?
                  <Image
                    alt={myProject.title}
                    height={360}
                    width={800}
                    src={myProject.shareImageUrl}
                    className='card-image-header'
                  /> : null}
                {myProject.links.length > 0 ?
                  myProject.links.map((link: any, key) =>
                    <Button
                      as='a'
                      fluid
                      size='large'
                      key={key}
                      href={withHttp(link.url)}
                      target='_blank'
                      className='project-button'
                      icon={link.icon}
                      content={link.text}
                      title={link.text}
                      rel='noopener' />)
                  : null}
                <Header style={{ color: '#212121', fontSize: '2.2em', wordWrap: 'break-word' }}>
                  {myProject.title}
                </Header>
                {myProject.roles && myProject.roles.length > 0
                  ?
                  myProject.roles.map((role: string, key) =>
                    <Label
                      key={key}
                      className='role-label'>
                      {role}
                    </Label>)
                  : null}
                {myProject.keywords && myProject.keywords.length > 0
                  ?
                  <div>
                    {myProject.keywords.map((keyword: string, key) =>
                      <Label
                        key={key}
                        className='keyword-label'>
                        {keyword}
                      </Label>)}
                  </div>
                  : null}
                {myProject.summary ?
                  myProject.summary.split('\n').map((item, i) => {
                    return <p
                      key={i}
                      style={{ fontSize: '1.5em', marginTop: '8px' }}>{item}</p>;
                  }) : null}
                {mdContent ?
                  <div style={{ fontSize: '1.5em' }}>
                    <ReactMarkdown linkTarget="_blank">
                      {mdContent}
                    </ReactMarkdown>
                  </div> : null}
              </Grid.Column>
            </Grid.Row>
            {myProject.testimonials && myProject.testimonials.length > 0 ?
              <Grid.Row style={{ padding: '1em 0 2em' }}>
                <Grid.Column width='9'>
                  <Header style={{ fontSize: '2.2em', textTransform: 'uppercase', wordWrap: 'break-word' }}>
                    Testimonials
                  </Header>
                  {myProject.testimonials.map((endorsement: any) =>
                    <EndorsementItem key={endorsement.name} endorsement={endorsement} />)}
                </Grid.Column>
              </Grid.Row> : null}
          </Grid>
        </Container>
      </Page>
    </div>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const dataDirectory = path.join(process.cwd(), '/data');
  const filename = 'me.json';

  const filePath = path.join(dataDirectory, filename);
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const portfolio = JSON.parse(fileContents);

  const paths = portfolio.projects.map((project: Project) => {
    return {
      params: {
        project: project.slug
      }
    }
  });


  return { paths, fallback: false }
}


export const getStaticProps: GetStaticProps = async context => {
  const projectName = context.params.project;
  const dataDirectory = path.join(process.cwd(), '/data');
  const filename = 'me.json';

  const filePath = path.join(dataDirectory, filename);
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const portfolio = JSON.parse(fileContents);

  //Load specific project from me.json
  const myProject = portfolio.projects.find((currentProject: Project) => currentProject.slug == projectName);

  //Load specific project markdown file
  const projectFilePath = path.join(process.cwd(), `/data/md/projects/${projectName}.md`);
  let projectFileContents = null;
  let mdData = null;
  let mdContent = null;
  if (fs.existsSync(projectFilePath)) {
    projectFileContents = fs.readFileSync(projectFilePath, 'utf8');
    const { data, content } = matter(projectFileContents);
    mdData = data;
    mdContent = content;
  }

  return {
    props: {
      portfolio,
      myProject,
      mdData: mdData,
      mdContent: mdContent
    }
  }
}