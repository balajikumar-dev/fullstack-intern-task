import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Check, LoaderCircle } from 'lucide-react';
import { getTemplate } from '../services/templateService';
import { assetUrl, errorMessage } from '../services/api';
import { FavoriteButton } from '../components/TemplateCard';
import usePageTitle from '../hooks/usePageTitle';
export default function TemplateDetails() {
  const { id } = useParams();
  const [result, setResult] = useState({ id: null, template: null, error: '' });
  const template = result.id === id ? result.template : null;
  const error = result.id === id ? result.error : '';
  usePageTitle(template?.name || 'Template preview');
  useEffect(() => {
    const controller = new AbortController();
    getTemplate(id, controller.signal)
      .then((template) => {
        if (!controller.signal.aborted) setResult({ id, template, error: '' });
      })
      .catch((failure) => {
        if (!controller.signal.aborted)
          setResult({
            id,
            template: null,
            error:
              failure.response?.status === 404
                ? 'This template could not be found.'
                : errorMessage(failure),
          });
      });
    return () => controller.abort();
  }, [id]);
  return (
    <main id="main-content" className="shell detail-page">
      <Link to="/templates" className="back-link">
        <ArrowLeft size={16} /> Back to the collection
      </Link>
      {error ? (
        <div className="error-state" role="alert">
          <h1>A different starting point, perhaps?</h1>
          <p>{error}</p>
          <Link to="/templates" className="button button-dark">
            Explore templates
          </Link>
        </div>
      ) : !template ? (
        <div className="page-loading" role="status">
          <LoaderCircle className="spin" /> Opening your next idea…
        </div>
      ) : (
        <div className="detail-grid">
          <div className="detail-art">
            <div className="preview-browser">
              <div className="browser-dots">
                <i />
                <i />
                <i />
              </div>
              <span>DESIGN PREVIEW</span>
              <ArrowUpRight size={13} />
            </div>
            <img
              src={assetUrl(template.thumbnail_url)}
              alt={`${template.name} full website design preview`}
              width="800"
              height="520"
            />
            <p>Look a little closer. Imagine what’s possible.</p>
          </div>
          <div className="detail-copy">
            <span className="category-tag">{template.category}</span>
            <h1>{template.name}</h1>
            <p className="detail-description">{template.description}</p>
            <FavoriteButton template={template} large />
            <a
              className="button button-outline"
              href={assetUrl(template.thumbnail_url)}
              target="_blank"
              rel="noreferrer"
            >
              Open full-size preview <ArrowUpRight size={17} />
            </a>
            <div className="detail-notes">
              <span>
                <Check size={16} /> A curated design starting point
              </span>
              <span>
                <Check size={16} /> Save it to your personal collection
              </span>
              <span>
                <Check size={16} /> Come back whenever inspiration strikes
              </span>
            </div>
            <p className="detail-fineprint">
              This is a design-preview catalog. Save your favorites to compare ideas for your next
              project.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
